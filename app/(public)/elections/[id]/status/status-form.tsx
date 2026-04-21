"use client";

import { useState } from "react";
import { lookupCandidateStatus } from "./actions";
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
import { Badge } from "@/components/ui/badge";
import {
  affiliationBadge,
  statusBadge,
  unwrap,
} from "@/app/_helpers/elections/status-display";
import type {
  StatusCandidateResult,
  StatusLookupFormProps,
} from "@/lib/types/public";

// @CodeScene(disable:"Complex Method","Complex Conditional","Large Method")
export function StatusLookupForm({
  electionId,
  electionName,
}: StatusLookupFormProps) {
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
          {candidates.map((c) => (
            <Card key={c.candidate_id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-lg">{c.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.student_id} &middot; {c.email}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {statusBadge(c.application_status)}
                    {affiliationBadge(c.affiliation_status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Position:</span>{" "}
                    <span className="font-medium">
                      {unwrap(c.positions)?.title || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Course:</span>{" "}
                    <span className="font-medium">
                      {(() => {
                        const course = unwrap(c.courses);
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
                        const pl = unwrap(c.partylists);
                        return pl
                          ? `${pl.acronym} — ${pl.name}`
                          : "Independent";
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Filed on:</span>{" "}
                    <span className="font-medium">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Rejection reason */}
                {c.application_status === "rejected" && c.rejection_reason && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                    <p className="font-medium">Reason for Rejection:</p>
                    <p>{c.rejection_reason}</p>
                  </div>
                )}

                {/* Documents */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Submitted Documents:
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {c.cog_link ? (
                      <a
                        href={c.cog_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        COG
                      </a>
                    ) : (
                      <span className="text-muted-foreground">COG: None</span>
                    )}
                    {c.cor_link ? (
                      <a
                        href={c.cor_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        COR
                      </a>
                    ) : (
                      <span className="text-muted-foreground">COR: None</span>
                    )}
                    {c.good_moral_link ? (
                      <a
                        href={c.good_moral_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        Good Moral
                      </a>
                    ) : (
                      <span className="text-muted-foreground">
                        Good Moral: None
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
