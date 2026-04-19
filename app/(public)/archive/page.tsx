import Link from "next/link";
import { notFound } from "next/navigation";
import { getElectionState } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getElectionResults } from "../elections/[id]/vote/actions";
import type { ConcludedElection } from "@/lib/types/public";

export default async function ArchivePage() {
  const adminSupabase = await createAdminClient();

  const { data: elections, error } = await adminSupabase
    .from("elections")
    .select(
      "election_id, name, election_type, start_date, end_date, is_archived",
    )
    .order("end_date", { ascending: false });

  if (error) {
    notFound();
  }

  const concluded = ((elections || []) as ConcludedElection[]).filter(
    (election) =>
      election.is_archived ||
      getElectionState(election.start_date, election.end_date) === "ended",
  );

  const resultsByElection = await Promise.all(
    concluded.map(async (election) => {
      const data = await getElectionResults(election.election_id);
      return { electionId: election.election_id, data };
    }),
  );

  const resultMap = new Map(
    resultsByElection.map((r) => [r.electionId, r.data]),
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Elections
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Election Results Archive</h1>
          <p className="text-muted-foreground">
            View final results for all concluded elections.
          </p>
        </div>

        {concluded.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">
                No concluded elections yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {concluded.map((election) => {
              const resultData = resultMap.get(election.election_id);
              const results =
                resultData && !resultData.error
                  ? (resultData.results ?? [])
                  : [];
              const totalVoters =
                resultData && !resultData.error
                  ? (resultData.totalVoters ?? 0)
                  : 0;

              return (
                <Card key={election.election_id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{election.name}</CardTitle>
                        <CardDescription>
                          {election.election_type} ·{" "}
                          {new Date(election.start_date).toLocaleDateString()} -{" "}
                          {new Date(election.end_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={election.is_archived ? "outline" : "secondary"}
                      >
                        {election.is_archived ? "Archived" : "Concluded"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Total votes cast:{" "}
                      <span className="font-semibold text-foreground">
                        {totalVoters}
                      </span>
                    </p>

                    {resultData?.error ? (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <p className="text-sm text-destructive">
                          Failed to load results for this election.
                        </p>
                      </div>
                    ) : results.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No published results yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {results.map((position) => {
                          const winners = position.candidates
                            .filter((candidate) => candidate.vote_count > 0)
                            .slice(0, position.max_votes);

                          return (
                            <div
                              key={position.position_id}
                              className="border rounded-lg p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-medium">
                                  {position.title}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {position.max_votes > 1
                                    ? `${position.max_votes} winners`
                                    : "1 winner"}
                                </Badge>
                              </div>

                              {winners.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  No winning candidates.
                                </p>
                              ) : (
                                <ul className="space-y-1">
                                  {winners.map((winner) => (
                                    <li
                                      key={winner.candidate_id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span className="font-medium">
                                        {winner.full_name}
                                        {winner.partylist
                                          ? ` (${winner.partylist.acronym})`
                                          : " (IND)"}
                                      </span>
                                      <span className="font-semibold tabular-nums">
                                        {winner.vote_count}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
