"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteElection } from "../actions";
import type { DeleteElectionButtonProps } from "@/lib/types/officer-elections";

export function DeleteElectionButton({
  electionId,
  electionName,
  canDelete,
}: DeleteElectionButtonProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState("");

  const registryPath = pathname.startsWith("/admin/elections")
    ? "/admin/elections"
    : "/officer/elections";

  const isConfirmationMatch = confirmName.trim() === electionName;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
      setConfirmName("");
    }
  }

  async function handleDelete() {
    if (!canDelete) return;

    setError(null);
    setLoading(true);

    const result = await deleteElection(electionId);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    handleOpenChange(false);
    window.location.assign(registryPath);
  }

  if (!canDelete) {
    return (
      <Button variant="destructive" size="sm" disabled>
        Delete Election
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete Election
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Election</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{electionName}</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="confirm-election-name">
            Re-enter election name to confirm deletion
          </Label>
          <Input
            id="confirm-election-name"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={electionName}
            autoComplete="off"
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || !isConfirmationMatch}
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
