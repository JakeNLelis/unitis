import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { StatusLookupForm } from "./status-form";
import Link from "next/link";

async function StatusPageContent({ electionId }: { electionId: string }) {
  const supabase = await createClient();

  const { data: election, error } = await supabase
    .from("elections")
    .select("election_id, name, election_type")
    .eq("election_id", electionId)
    .single();

  if (error || !election) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-10 px-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Application Status</h1>
          <p className="text-lg text-muted-foreground">{election.name}</p>
          <Badge variant="outline">{election.election_type}</Badge>
        </div>

        <StatusLookupForm
          electionId={electionId}
          electionName={election.name}
        />

        <div className="text-center space-y-2">
          <Link
            href={`/elections/${electionId}/apply`}
            className="text-sm text-primary hover:underline"
          >
            ← File a Candidacy Application
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StatusPage({
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
      <StatusPageWrapper params={params} />
    </Suspense>
  );
}

async function StatusPageWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StatusPageContent electionId={id} />;
}
