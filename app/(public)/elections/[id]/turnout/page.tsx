import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getElectionState } from "@/lib/utils";
import { getTurnoutSnapshot } from "@/lib/turnout/read-model";
import { TurnoutSummaryCard } from "@/components/turnout-summary-card";
import { TurnoutLiveClient } from "@/components/turnout-live-client";

interface TurnoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function TurnoutPage({ params }: TurnoutPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: election, error } = await supabase
    .from("elections")
    .select("election_id, name, start_date, end_date")
    .eq("election_id", id)
    .single();

  if (error || !election) {
    notFound();
  }

  const state = getElectionState(election.start_date, election.end_date);

  if (state !== "active") {
    redirect(`/archive/${id}`);
  }

  const snapshot = await getTurnoutSnapshot(id);

  return (
    <main className="container max-w-4xl mx-auto px-4 py-10">
      <div className="space-y-6">
        {/* Back navigation */}
        <div>
          <Link
            href={`/elections/${id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to {election.name}
          </Link>
        </div>

        {/* Live Turnout Header */}
        <div>
          <h1 className="text-2xl font-bold">Live Turnout</h1>
          <p className="text-muted-foreground mt-2">{election.name}</p>
        </div>

        <TurnoutSummaryCard data={snapshot} />
        <TurnoutLiveClient electionId={id} initialSnapshot={snapshot} />
      </div>
    </main>
  );
}
