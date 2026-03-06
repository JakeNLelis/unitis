import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EligibilityCheck } from "@/components/eligibility-check";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CheckEligibilityPage({ params }: Props) {
  const { id: electionId } = await params;

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
        <Link
          href={`/elections/${electionId}/vote`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to election
        </Link>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Voter Eligibility Check</h1>
          <p className="text-muted-foreground">{election.name}</p>
        </div>

        <EligibilityCheck
          electionId={electionId}
          electionName={election.name}
        />
      </div>
    </div>
  );
}
