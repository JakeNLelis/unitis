"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateCandidateStatus } from "../actions";

export function CandidateActions({
  candidateId,
  currentStatus,
  canApprove,
}: {
  candidateId: string;
  currentStatus: string;
  canApprove: boolean;
  electionId?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleConflict(result: unknown) {
    if (!result || typeof result !== "object") {
      return false;
    }
    const code = (result as { code?: string }).code;
    if (code !== "candidate_already_processed") {
      return false;
    }
    const message =
      (result as { error?: string }).error ||
      "This candidate was already processed by someone else.";
    setConflictMessage(message);
    setShowConflictModal(true);
    router.refresh();
    return true;
  }

  async function handleApprove() {
    setIsLoading(true);
    setError(null);
    const result = await updateCandidateStatus(candidateId, "approved");
    if (handleConflict(result)) {
      setIsLoading(false);
      return;
    }
    if (!result || (typeof result === "object" && "error" in result)) {
      setError((result as { error?: string })?.error ?? "Unknown error");
    }
    setIsLoading(false);
    router.refresh();
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await updateCandidateStatus(
      candidateId,
      "rejected",
      rejectionReason.trim(),
    );
    if (handleConflict(result)) {
      setIsLoading(false);
      return;
    }
    if (!result || (typeof result === "object" && "error" in result)) {
      setError((result as { error?: string })?.error ?? "Unknown error");
    } else {
      setShowRejectModal(false);
      setRejectionReason("");
    }
    setIsLoading(false);
    router.refresh();
  }

  if (currentStatus !== "pending") {
    return (
      <span className="text-xs text-muted-foreground capitalize">
        {currentStatus}
      </span>
    );
  }

  if (!canApprove) {
    return <span className="text-xs text-muted-foreground">Pending</span>;
  }

  return (
    <>
      <div className="flex gap-1">
        {error && !showRejectModal && (
          <span className="text-xs text-destructive">{error}</span>
        )}
        <Button
          size="sm"
          variant="default"
          className="h-7 text-xs"
          disabled={isLoading}
          onClick={handleApprove}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="h-7 text-xs"
          disabled={isLoading}
          onClick={() => setShowRejectModal(true)}
        >
          Reject
        </Button>
      </div>

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Candidate Application</DialogTitle>
            <DialogDescription>
              Please provide a mandatory justification for rejecting this
              candidate. This reason will be visible to the candidate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection_reason">Reason for Rejection *</Label>
            <Textarea
              id="rejection_reason"
              placeholder="e.g., Submitted documents could not be verified..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason("");
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading || !rejectionReason.trim()}
              onClick={handleReject}
            >
              {isLoading ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConflictModal} onOpenChange={setShowConflictModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Already Processed</DialogTitle>
            <DialogDescription>
              {conflictMessage ||
                "This candidate was already processed by someone else."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowConflictModal(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
