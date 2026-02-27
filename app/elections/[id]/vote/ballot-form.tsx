"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { submitBallot } from "./actions";

interface CandidateOption {
  candidate_id: string;
  full_name: string;
  position_id: string;
  partylist: { name: string; acronym: string } | null;
}

interface PositionWithCandidates {
  position_id: string;
  title: string;
  max_votes: number;
  candidates: CandidateOption[];
}

interface BallotFormProps {
  electionId: string;
  electionName: string;
  positions: PositionWithCandidates[];
}

export function BallotForm({
  electionId,
  electionName,
  positions,
}: BallotFormProps) {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleCandidate(
    positionId: string,
    candidateId: string,
    maxVotes: number,
  ) {
    setSelections((prev) => {
      const current = prev[positionId] || [];
      if (current.includes(candidateId)) {
        return {
          ...prev,
          [positionId]: current.filter((id) => id !== candidateId),
        };
      }
      if (current.length >= maxVotes) {
        // Replace oldest selection if at max
        return {
          ...prev,
          [positionId]: [...current.slice(1), candidateId],
        };
      }
      return {
        ...prev,
        [positionId]: [...current, candidateId],
      };
    });
  }

  function getTotalSelections() {
    return Object.values(selections).reduce((sum, arr) => sum + arr.length, 0);
  }

  async function handleSubmit() {
    if (!studentId.trim()) {
      setError("Please enter your student ID.");
      return;
    }
    setError(null);
    setLoading(true);

    const result = await submitBallot({
      electionId,
      studentId: studentId.trim(),
      selections,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      setConfirmOpen(false);
      return;
    }

    setConfirmOpen(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto size-12 rounded-full bg-green-600 flex items-center justify-center text-white text-xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold">Vote Submitted!</h2>
          <p className="text-muted-foreground">
            Your ballot for{" "}
            <span className="font-semibold">{electionName}</span> has been
            recorded successfully.
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Voter Identification</CardTitle>
          <CardDescription>
            Enter your student ID to verify your eligibility to vote.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="student-id">Student ID</Label>
            <Input
              id="student-id"
              placeholder="e.g. 20-1-01457"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {positions.map((position) => {
        const selected = selections[position.position_id] || [];
        return (
          <Card key={position.position_id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{position.title}</CardTitle>
                  <CardDescription>
                    Select up to {position.max_votes} candidate
                    {position.max_votes !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {selected.length}/{position.max_votes}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {position.candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No approved candidates for this position.
                </p>
              ) : (
                <div className="space-y-3">
                  {position.candidates.map((candidate) => {
                    const isChecked = selected.includes(candidate.candidate_id);
                    return (
                      <label
                        key={candidate.candidate_id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() =>
                            toggleCandidate(
                              position.position_id,
                              candidate.candidate_id,
                              position.max_votes,
                            )
                          }
                        />
                        <div className="flex-1">
                          <p className="font-medium">{candidate.full_name}</p>
                          {candidate.partylist ? (
                            <p className="text-sm text-muted-foreground">
                              {candidate.partylist.name} (
                              {candidate.partylist.acronym})
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Independent
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-muted-foreground">
          {getTotalSelections()} candidate
          {getTotalSelections() !== 1 ? "s" : ""} selected
        </p>
        <Button
          size="lg"
          disabled={getTotalSelections() === 0 || !studentId.trim() || loading}
          onClick={() => setConfirmOpen(true)}
        >
          Review & Submit Ballot
        </Button>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Ballot</DialogTitle>
            <DialogDescription>
              Please review your selections. Once submitted, your vote cannot be
              changed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            {positions.map((position) => {
              const selected = selections[position.position_id] || [];
              if (selected.length === 0) return null;
              return (
                <div key={position.position_id}>
                  <p className="text-sm font-medium text-muted-foreground">
                    {position.title}
                  </p>
                  <ul className="mt-1 space-y-1">
                    {selected.map((candidateId) => {
                      const candidate = position.candidates.find(
                        (c) => c.candidate_id === candidateId,
                      );
                      return (
                        <li key={candidateId} className="text-sm font-medium">
                          {candidate?.full_name || "Unknown"}
                          {candidate?.partylist && (
                            <span className="text-muted-foreground">
                              {" "}
                              — {candidate.partylist.acronym}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {/* Positions with no selections */}
            {positions
              .filter((p) => (selections[p.position_id] || []).length === 0)
              .map((p) => (
                <div key={p.position_id}>
                  <p className="text-sm font-medium text-muted-foreground">
                    {p.title}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    No selection (abstain)
                  </p>
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Go Back
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Ballot"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
