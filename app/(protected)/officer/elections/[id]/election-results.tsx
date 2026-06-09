"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getElectionResults } from "@/app/(public)/elections/[id]/vote/actions";

import type {
  ElectionResultsProps,
  OfficerPositionResult,
} from "@/lib/types/officer-elections";

/**
 * Client component for election results.
 * Currently fetches on mount + manual refresh.
 * Designed so a future WebSocket/realtime subscription can push updates
 * by calling setResults / setTotalVoters directly.
 */
export function ElectionResults({ electionId, electionName }: ElectionResultsProps) {
  const [results, setResults] = useState<OfficerPositionResult[]>([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);

    const data = await getElectionResults(electionId);

    if (data.error) {
      setError(data.error);
      setLoading(false);
      return;
    }

    if (data.results) {
      setResults(data.results);
      setTotalVoters(data.totalVoters || 0);
    }

    setLoading(false);
  }, [electionId]);

  useEffect(() => {
    fetchResults();
    // Future: subscribe to realtime channel here
    // return () => { unsubscribe(); };
  }, [fetchResults]);

  if (loading) {
    return <p className="text-muted-foreground">Loading results...</p>;
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Total votes cast:{" "}
            <span className="font-semibold">{totalVoters}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {electionName && results.length > 0 && (
            <Button variant="outline" size="sm" onClick={async () => {
              try {
                // We'll lazy import the PDF generator to avoid bloat if not used
                const { pdf } = await import("@react-pdf/renderer");
                const ElectionResultPDF = (await import("@/app/(protected)/officer/elections/[id]/results-pdf")).default;
                
                // Format results for the PDF which expects ArchiveCandidateResult[]
                const formattedResults = results.flatMap(position => 
                  position.candidates.map(c => ({
                    candidate_id: c.candidate_id,
                    full_name: c.full_name,
                    position_title: position.title,
                    vote_total: c.vote_count
                  }))
                );
                
                const blob = await pdf(
                  <ElectionResultPDF
                    electionName={electionName}
                    totalVotes={totalVoters}
                    // Since this is live tally, expectedVoters and turnout are hard to know precisely here without more data
                    // We can pass placeholder values or adjust the PDF to handle nulls
                    expectedVoters={0} 
                    turnoutPercentage={0}
                    quorumTarget={0}
                    quorumMet={true} // Placeholder
                    candidateResults={formattedResults}
                  />
                ).toBlob();

                const objectUrl = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = objectUrl;
                anchor.download = `election-results-${electionName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
                URL.revokeObjectURL(objectUrl);
              } catch (error) {
                console.error("Error generating PDF:", error);
              }
            }}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchResults}>
            Refresh Results
          </Button>
        </div>
      </div>

      {results.map((position) => {
        const maxCount = Math.max(
          ...position.candidates.map((c) => c.vote_count),
          1,
        );

        return (
          <Card key={position.position_id}>
            <CardHeader>
              <CardTitle>{position.title}</CardTitle>
              <CardDescription>
                {position.candidates.length} candidate
                {position.candidates.length !== 1 ? "s" : ""} ·{" "}
                {position.max_votes > 1
                  ? `${position.max_votes} winners`
                  : "1 winner"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {position.candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No approved candidates.
                </p>
              ) : (
                <div className="space-y-3">
                  {position.candidates.map((candidate, index) => (
                    <div key={candidate.candidate_id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {candidate.full_name}
                          </span>
                          {candidate.partylist && (
                            <Badge variant="outline" className="text-xs">
                              {candidate.partylist.acronym}
                            </Badge>
                          )}
                          {!candidate.partylist && (
                            <Badge variant="outline" className="text-xs">
                              IND
                            </Badge>
                          )}
                          {index < position.max_votes &&
                            candidate.vote_count > 0 && (
                              <Badge className="bg-green-600 text-xs">
                                Leading
                              </Badge>
                            )}
                        </div>
                        <span className="text-sm font-semibold tabular-nums">
                          {candidate.vote_count}
                        </span>
                      </div>
                      {/* Bar */}
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{
                            width: `${maxCount > 0 ? (candidate.vote_count / maxCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
