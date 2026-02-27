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

interface EditElectionDatesProps {
  electionId: string;
  candidacyStartDate: string | null;
  candidacyEndDate: string | null;
  startDate: string;
  endDate: string;
}

function toDatetimeLocal(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  // Format as YYYY-MM-DDTHH:mm for datetime-local input
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function EditElectionDates({
  electionId,
  candidacyStartDate,
  candidacyEndDate,
  startDate,
  endDate,
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

    const result = await updateElectionDates(electionId, {
      start_date: votingStart,
      end_date: votingEnd,
      candidacy_start_date: candStart || null,
      candidacy_end_date: candEnd || null,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
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
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Candidacy Filing Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candidacyStartDate && candidacyEndDate ? (
            <p className="font-medium">
              {new Date(candidacyStartDate).toLocaleString()} –{" "}
              {new Date(candidacyEndDate).toLocaleString()}
            </p>
          ) : (
            <p className="text-muted-foreground">Not set</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Voting Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">
            {new Date(startDate).toLocaleString()} –{" "}
            {new Date(endDate).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
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
      </div>
    </div>
  );
}
