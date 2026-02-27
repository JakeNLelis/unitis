import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BallotForm } from "./ballot-form";

async function VotingContent({ electionId }: { electionId: string }) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const adminSupabase = await createAdminClient();

  // Fetch election
  const { data: election, error: electionError } = await adminSupabase
    .from("elections")
    .select(
      "election_id, name, election_type, start_date, end_date, is_archived",
    )
    .eq("election_id", electionId)
    .single();

  if (electionError || !election) {
    notFound();
  }

  // Check voting period
  const now = new Date();
  const start = new Date(election.start_date);
  const end = new Date(election.end_date);
  const votingOpen = !election.is_archived && now >= start && now <= end;

  // Check if user already voted
  const userEmail = user.email!;
  const { data: existingVoter } = await adminSupabase
    .from("voters")
    .select("voter_id, is_voted")
    .eq("election_id", electionId)
    .eq("email", userEmail)
    .single();

  const alreadyVoted = existingVoter?.is_voted === true;

  // If not in voting period or already voted, show info card
  if (!votingOpen || alreadyVoted) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Elections
        </Link>
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            {alreadyVoted ? (
              <>
                <div className="text-5xl">✓</div>
                <h2 className="text-2xl font-bold">Already Voted</h2>
                <p className="text-muted-foreground">
                  You have already submitted your ballot for{" "}
                  <span className="font-semibold">{election.name}</span>.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">Voting Closed</h2>
                <p className="text-muted-foreground">
                  {now < start
                    ? `Voting opens on ${start.toLocaleString()}.`
                    : "The voting period for this election has ended."}
                </p>
              </>
            )}
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch positions with approved candidates
  const { data: positions } = await adminSupabase
    .from("positions")
    .select("position_id, title, max_votes")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  const { data: candidates } = await adminSupabase
    .from("candidates")
    .select("candidate_id, full_name, position_id, partylists(name, acronym)")
    .eq("election_id", electionId)
    .eq("application_status", "approved");

  const positionsWithCandidates = (positions || []).map((position) => ({
    ...position,
    candidates: (candidates || [])
      .filter((c) => c.position_id === position.position_id)
      .map((c) => ({
        candidate_id: c.candidate_id,
        full_name: c.full_name,
        position_id: c.position_id,
        partylist: c.partylists as unknown as {
          name: string;
          acronym: string;
        } | null,
      })),
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Elections
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{election.name}</h1>
        <p className="text-muted-foreground">{election.election_type}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Voting as <span className="font-medium">{userEmail}</span>
        </p>
      </div>

      <BallotForm
        electionId={electionId}
        electionName={election.name}
        positions={positionsWithCandidates}
      />
    </div>
  );
}

export default function VotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-10 px-4">
        <Suspense
          fallback={<p className="text-muted-foreground">Loading ballot...</p>}
        >
          <VotePageWrapper params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function VotePageWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VotingContent electionId={id} />;
}
