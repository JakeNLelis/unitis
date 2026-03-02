import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { AffiliationManager } from "./affiliation-manager";
import Link from "next/link";

async function ManagePartylistContent({ electionId }: { electionId: string }) {
  const supabase = await createClient();

  const { data: election, error } = await supabase
    .from("elections")
    .select("election_id, name, election_type")
    .eq("election_id", electionId)
    .single();

  if (error || !election) {
    notFound();
  }

  // Fetch all partylists for this election (with their registered emails)
  const { data: partylists } = await supabase
    .from("partylists")
    .select(
      "partylist_id, name, acronym, registered_by_email, registered_by_name",
    )
    .eq("election_id", electionId)
    .order("name", { ascending: true });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-10 px-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Manage Partylist Affiliations</h1>
          <p className="text-lg text-muted-foreground">{election.name}</p>
          <Badge variant="outline">{election.election_type}</Badge>
        </div>

        <AffiliationManager
          electionId={electionId}
          electionName={election.name}
          partylists={partylists || []}
        />

        <div className="text-center">
          <Link
            href={`/elections/${electionId}/apply`}
            className="text-sm text-primary hover:underline"
          >
            ← Back to Candidacy Application
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ManagePartylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container max-w-3xl mx-auto py-10 px-4 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ManagePartylistWrapper params={params} />
    </Suspense>
  );
}

async function ManagePartylistWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ManagePartylistContent electionId={id} />;
}
