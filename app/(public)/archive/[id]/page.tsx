import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArchiveResultsBreakdown,
  type ArchiveCandidateResult,
} from "@/components/archive-results-breakdown";
import { getElectionState } from "@/lib/utils";
import type { ArchiveDetailPageProps } from "@/lib/types/public";

export default async function ArchiveDetailPage({
  params,
}: ArchiveDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: election, error } = await supabase
    .from("elections")
    .select(
      "election_id, name, election_type, start_date, end_date, is_archived",
    )
    .eq("election_id", id)
    .single();

  if (error || !election) {
    notFound();
  }

  const isEnded =
    election.is_archived ||
    getElectionState(election.start_date, election.end_date) === "ended";
  if (!isEnded) {
    return (
      <main className="container max-w-4xl mx-auto px-4 py-10">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Archive details are only available for ended elections.
            </p>
            <Link
              href={`/elections/${id}`}
              className="text-sm text-primary hover:underline"
            >
              Return to event page
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { data: candidates } = await supabase
    .from("candidates")
    .select("candidate_id, full_name, position_id")
    .eq("election_id", id)
    .eq("application_status", "approved")
    .order("full_name", { ascending: true });

  const { data: positions } = await supabase
    .from("positions")
    .select("position_id, title")
    .eq("election_id", id);

  const positionTitleMap = new Map(
    (positions ?? []).map((position) => [position.position_id, position.title]),
  );

  const results: ArchiveCandidateResult[] = [];

  for (const candidate of candidates ?? []) {
    const { count } = await supabase
      .from("vote_selections")
      .select("*", { count: "exact", head: true })
      .eq("candidate_id", candidate.candidate_id);

    results.push({
      candidate_id: candidate.candidate_id,
      full_name: candidate.full_name,
      position_title:
        positionTitleMap.get(candidate.position_id) ?? "Candidate",
      vote_total: count ?? 0,
    });
  }

  const { count: totalVotes } = await supabase
    .from("voters")
    .select("*", { count: "exact", head: true })
    .eq("election_id", id)
    .eq("is_voted", true);

  const { count: expectedVoters } = await supabase
    .from("voters")
    .select("*", { count: "exact", head: true })
    .eq("election_id", id);

  const total = totalVotes ?? 0;
  const expected = expectedVoters ?? 0;
  const turnout = expected === 0 ? 0 : (total / expected) * 100;

  return (
    <main className="container max-w-4xl mx-auto px-4 py-10">
      <div className="space-y-6">
        <div>
          <Link
            href="/archive"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to archive
          </Link>
        </div>

        <ArchiveResultsBreakdown
          electionName={election.name}
          totalVotes={total}
          expectedVoters={expected}
          turnoutPercentage={turnout}
          candidateResults={results}
        />
      </div>
    </main>
  );
}
