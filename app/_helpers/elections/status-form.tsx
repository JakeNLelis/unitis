"use client";

import { useState } from "react";
import { lookupCandidateStatus } from "@/app/(public)/elections/[id]/status/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  affiliationBadge,
  statusBadge,
  unwrap,
} from "@/app/_helpers/elections/status-display";
import type { StatusCandidateResult } from "@/lib/types/public";

function StatusResultCard({ candidate }: { candidate: StatusCandidateResult }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="font-semibold text-lg">{candidate.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {candidate.student_id} &middot; {candidate.email}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusBadge(candidate.application_status)}
            {affiliationBadge(candidate.affiliation_status)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Position:</span>{" "}
            <span className="font-medium">
              {unwrap(candidate.positions)?.title || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Course:</span>{" "}
            <span className="font-medium">
              {(() => {
                const course = unwrap(candidate.courses);
                return course
                  ? course.acronym
                    ? `${course.acronym} — ${course.name}`
                    : course.name
                  : "N/A";
              })()}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Partylist:</span>{" "}
            <span className="font-medium">
              {(() => {
                const partylist = unwrap(candidate.partylists);
                return partylist
                  ? `${partylist.acronym} — ${partylist.name}`
                  : "Independent";
              })()}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Filed on:</span>{" "}
            <span className="font-medium">
              {new Date(candidate.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {candidate.application_status === "rejected" &&
          candidate.rejection_reason && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              <p className="font-medium">Reason for Rejection:</p>
              <p>{candidate.rejection_reason}</p>
            </div>
          )}

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Submitted Documents:
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            {candidate.cog_link ? (
              <a
                href={candidate.cog_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                COG
              </a>
            ) : (
              <span className="text-muted-foreground">COG: None</span>
            )}
            {candidate.cor_link ? (
              <a
                href={candidate.cor_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                COR
              </a>
            ) : (
              <span className="text-muted-foreground">COR: None</span>
            )}
            {candidate.good_moral_link ? (
              <a
                href={candidate.good_moral_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Good Moral
              </a>
            ) : (
              <span className="text-muted-foreground">Good Moral: None</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusLookupForm({
  electionId,
  electionName,
}: {
  electionId: string;
  electionName: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<StatusCandidateResult[] | null>(
    null,
  );

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCandidates(null);
    setLoading(true);

    const result = await lookupCandidateStatus(email, electionId);
    if (result.error) {
      setError(result.error);
    } else if (result.candidates) {
      setCandidates(result.candidates as unknown as StatusCandidateResult[]);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <form onSubmit={handleLookup} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Check Your Application Status
            </CardTitle>
            <CardDescription>
              Enter the email you used when filing your candidacy for{" "}
              <strong>{electionName}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan.delacruz@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Looking up..." : "Check Status"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md border border-destructive/20 text-center">
          {error}
        </div>
      )}

      {candidates && candidates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {candidates.length === 1
              ? "Your Application"
              : `Your Applications (${candidates.length})`}
          </h3>
          {candidates.map((candidate) => (
            <StatusResultCard
              key={candidate.candidate_id}
              candidate={candidate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
