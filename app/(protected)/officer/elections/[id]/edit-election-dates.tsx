"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateElectionDates } from "../actions";
import type { EditElectionDatesProps } from "@/lib/types/officer-elections";
import { toDatetimeLocal } from "@/app/_helpers/datetime";

function validateDates(
  votingStart: string,
  votingEnd: string,
  candStart: string,
  candEnd: string,
  originalDates: {
    candidacyStartDate: string | null;
    candidacyEndDate: string | null;
    startDate: string;
    endDate: string;
  }
): { error: string | null; payload?: any } {
  const votingStartDate = new Date(votingStart);
  const votingEndDate = new Date(votingEnd);

  if (
    Number.isNaN(votingStartDate.getTime()) ||
    Number.isNaN(votingEndDate.getTime())
  ) {
    return { error: "Please provide valid voting dates." };
  }

  if (votingEndDate <= votingStartDate) {
    return { error: "Voting end date must be after voting start date." };
  }

  if (candStart && candEnd) {
    const candStartDate = new Date(candStart);
    const candEndDate = new Date(candEnd);

    if (
      Number.isNaN(candStartDate.getTime()) ||
      Number.isNaN(candEndDate.getTime())
    ) {
      return { error: "Please provide valid candidacy filing dates." };
    }

    if (candStartDate >= candEndDate) {
      return { error: "Candidacy start date must be before candidacy end date." };
    }

    if (candEndDate >= votingStartDate) {
      return { error: "Candidacy filing deadline must be before voting start date." };
    }
  }

  const toISO = (local: string) => (local ? new Date(local).toISOString() : null);

  const nowSubmit = new Date();
  const isCandStartPassedSubmit = originalDates.candidacyStartDate ? new Date(originalDates.candidacyStartDate) <= nowSubmit : false;
  const isCandEndPassedSubmit = originalDates.candidacyEndDate ? new Date(originalDates.candidacyEndDate) <= nowSubmit : false;
  const isVotingStartPassedSubmit = originalDates.startDate ? new Date(originalDates.startDate) <= nowSubmit : false;
  const isVotingEndPassedSubmit = originalDates.endDate ? new Date(originalDates.endDate) <= nowSubmit : false;

  const originalCandStartISO = originalDates.candidacyStartDate ? new Date(originalDates.candidacyStartDate).toISOString() : null;
  const originalCandEndISO = originalDates.candidacyEndDate ? new Date(originalDates.candidacyEndDate).toISOString() : null;
  const originalVotingStartISO = originalDates.startDate ? new Date(originalDates.startDate).toISOString() : null;
  const originalVotingEndISO = originalDates.endDate ? new Date(originalDates.endDate).toISOString() : null;

  if (isCandStartPassedSubmit && toISO(candStart) !== originalCandStartISO) {
    return { error: "Cannot modify candidacy start date after it has passed." };
  }
  if (isCandEndPassedSubmit && toISO(candEnd) !== originalCandEndISO) {
    return { error: "Cannot modify candidacy end date after it has passed." };
  }
  if (isVotingStartPassedSubmit && toISO(votingStart) !== originalVotingStartISO) {
    return { error: "Cannot modify voting start date after it has passed." };
  }
  if (isVotingEndPassedSubmit && toISO(votingEnd) !== originalVotingEndISO) {
    return { error: "Cannot modify voting end date after it has passed." };
  }

  return {
    error: null,
    payload: {
      start_date: votingStartDate.toISOString(),
      end_date: votingEndDate.toISOString(),
      candidacy_start_date: toISO(candStart),
      candidacy_end_date: toISO(candEnd),
    },
  };
}

export function EditElectionDates({
  electionId,
  candidacyStartDate,
  candidacyEndDate,
  startDate,
  endDate,
  canEdit,
}: EditElectionDatesProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [candStart, setCandStart] = useState(
    toDatetimeLocal(candidacyStartDate),
  );
  const [candEnd, setCandEnd] = useState(toDatetimeLocal(candidacyEndDate));
  const [votingStart, setVotingStart] = useState(toDatetimeLocal(startDate));
  const [votingEnd, setVotingEnd] = useState(toDatetimeLocal(endDate));

  const now = new Date();
  const isCandStartPassed = candidacyStartDate ? new Date(candidacyStartDate) <= now : false;
  const isCandEndPassed = candidacyEndDate ? new Date(candidacyEndDate) <= now : false;
  const isVotingStartPassed = startDate ? new Date(startDate) <= now : false;
  const isVotingEndPassed = endDate ? new Date(endDate) <= now : false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const validation = validateDates(votingStart, votingEnd, candStart, candEnd, {
      candidacyStartDate,
      candidacyEndDate,
      startDate,
      endDate,
    });

    if (validation.error) {
      setError(validation.error);
      setLoading(false);
      return;
    }

    try {
      const result = await updateElectionDates(electionId, validation.payload);

      if (!result || (typeof result === "object" && "error" in result)) {
        setError(((result as Record<string, unknown>)?.error as string) ?? "Failed to update election dates.");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch (submitError) {
      console.error(submitError);
      setError("Failed to update election dates. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      // Reset to current values when opening
      setCandStart(toDatetimeLocal(candidacyStartDate));
      setCandEnd(toDatetimeLocal(candidacyEndDate));
      setVotingStart(toDatetimeLocal(startDate));
      setVotingEnd(toDatetimeLocal(endDate));
      setError(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-muted-foreground">
            Candidacy Filing Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candidacyStartDate && candidacyEndDate ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Start
                </p>
                <p className="text-sm font-bold">
                  {new Date(candidacyStartDate).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-left sm:text-right">
                  End
                </p>
                <p className="text-sm font-bold text-left sm:text-right">
                  {new Date(candidacyEndDate).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Temporal parameters not initialized.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-muted-foreground">
            Voting Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Start
              </p>
              <p className="text-sm font-bold">
                {new Date(startDate).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-left sm:text-right">
                End
              </p>
              <p className="text-sm font-bold text-left sm:text-right">
                {new Date(endDate).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        {canEdit ? (
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Edit Dates
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Election Dates</DialogTitle>
                <DialogDescription>
                  Update the candidacy filing and voting periods.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
                    {error}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="cand_start">
                    Candidacy Start {isCandStartPassed && <span className="text-xs text-amber-600 font-bold ml-2">(Locked — Passed)</span>}
                  </Label>
                  <Input
                    id="cand_start"
                    type="datetime-local"
                    value={candStart}
                    onChange={(e) => setCandStart(e.target.value)}
                    disabled={isCandStartPassed}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cand_end">
                    Candidacy End {isCandEndPassed && <span className="text-xs text-amber-600 font-bold ml-2">(Locked — Passed)</span>}
                  </Label>
                  <Input
                    id="cand_end"
                    type="datetime-local"
                    value={candEnd}
                    onChange={(e) => setCandEnd(e.target.value)}
                    disabled={isCandEndPassed}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voting_start">
                    Voting Start {isVotingStartPassed && <span className="text-xs text-amber-600 font-bold ml-2">(Locked — Passed)</span>}
                  </Label>
                  <Input
                    id="voting_start"
                    type="datetime-local"
                    value={votingStart}
                    onChange={(e) => setVotingStart(e.target.value)}
                    required
                    disabled={isVotingStartPassed}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voting_end">
                    Voting End {isVotingEndPassed && <span className="text-xs text-amber-600 font-bold ml-2">(Locked — Passed)</span>}
                  </Label>
                  <Input
                    id="voting_end"
                    type="datetime-local"
                    value={votingEnd}
                    onChange={(e) => setVotingEnd(e.target.value)}
                    required
                    disabled={isVotingEndPassed}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Dates"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <p className="text-xs text-muted-foreground">Read-only access.</p>
        )}
      </div>
    </div>
  );
}
