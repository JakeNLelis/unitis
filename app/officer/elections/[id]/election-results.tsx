"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getElectionResults } from "@/app/elections/[id]/vote/actions";

interface CandidateResult {
  candidate_id: string;
  full_name: string;
  partylist: { name: string; acronym: string } | null;
  vote_count: number;
}

interface PositionResult {
  position_id: string;
  title: string;
  max_votes: number;
  candidates: CandidateResult[];
}

interface ElectionResultsProps {
  electionId: string;
}

/**
 * Client component for election results.
 * Currently fetches on mount + manual refresh.
 * Designed so a future WebSocket/realtime subscription can push updates
 * by calling setResults / setTotalVoters directly.
 */
export function ElectionResults({ electionId }: ElectionResultsProps) {
  const [results, setResults] = useState<PositionResult[]>([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchResults() {
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
  }

  useEffect(() => {
    fetchResults();
    // Future: subscribe to realtime channel here
    // return () => { unsubscribe(); };
  }, [electionId]);

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
            Total votes cast: <span className="font-semibold">{totalVoters}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchResults}>
          Refresh Results
        </Button>
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
