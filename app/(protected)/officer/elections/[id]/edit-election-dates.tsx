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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const votingStartDate = new Date(votingStart);
    const votingEndDate = new Date(votingEnd);

    if (
      Number.isNaN(votingStartDate.getTime()) ||
      Number.isNaN(votingEndDate.getTime())
    ) {
      setError("Please provide valid voting dates.");
      setLoading(false);
      return;
    }

    if (votingEndDate <= votingStartDate) {
      setError("Voting end date must be after voting start date.");
      setLoading(false);
      return;
    }

    if (candStart && candEnd) {
      const candStartDate = new Date(candStart);
      const candEndDate = new Date(candEnd);

      if (
        Number.isNaN(candStartDate.getTime()) ||
        Number.isNaN(candEndDate.getTime())
      ) {
        setError("Please provide valid candidacy filing dates.");
        setLoading(false);
        return;
      }

      if (candStartDate >= candEndDate) {
        setError("Candidacy start date must be before candidacy end date.");
        setLoading(false);
        return;
      }

      if (candEndDate >= votingStartDate) {
        setError("Candidacy filing deadline must be before voting start date.");
        setLoading(false);
        return;
      }
    }

    // datetime-local values are local time strings ("YYYY-MM-DDTHH:mm").
    // Convert to UTC ISO strings so PostgreSQL stores the correct moment
    // regardless of the DB server timezone.
    const toISO = (local: string) =>
      local ? new Date(local).toISOString() : null;

    try {
      const result = await updateElectionDates(electionId, {
        start_date: votingStartDate.toISOString(),
        end_date: votingEndDate.toISOString(),
        candidacy_start_date: toISO(candStart),
        candidacy_end_date: toISO(candEnd),
      });

      if (!result || (typeof result === "object" && "error" in result)) {
        setError((result as any)?.error ?? "Failed to update election dates.");
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Start
                </p>
                <p className="text-sm font-bold">
                  {new Date(candidacyStartDate).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">
                  End
                </p>
                <p className="text-sm font-bold text-right">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Start
              </p>
              <p className="text-sm font-bold">
                {new Date(startDate).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">
                End
              </p>
              <p className="text-sm font-bold text-right">
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
                  <Label htmlFor="cand_start">Candidacy Start</Label>
                  <Input
                    id="cand_start"
                    type="datetime-local"
                    value={candStart}
                    onChange={(e) => setCandStart(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cand_end">Candidacy End</Label>
                  <Input
                    id="cand_end"
                    type="datetime-local"
                    value={candEnd}
                    onChange={(e) => setCandEnd(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voting_start">Voting Start</Label>
                  <Input
                    id="voting_start"
                    type="datetime-local"
                    value={votingStart}
                    onChange={(e) => setVotingStart(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voting_end">Voting End</Label>
                  <Input
                    id="voting_end"
                    type="datetime-local"
                    value={votingEnd}
                    onChange={(e) => setVotingEnd(e.target.value)}
                    required
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
