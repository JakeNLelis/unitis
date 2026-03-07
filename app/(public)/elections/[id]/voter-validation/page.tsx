import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import { VoterValidationForm } from "./voter-validation-form";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VoterValidationPage({ params }: Props) {
  const { id: electionId } = await params;

  const adminSupabase = await createAdminClient();
  const { data: election, error } = await adminSupabase
    .from("elections")
    .select("election_id, name, election_type")
    .eq("election_id", electionId)
    .single();

  if (error || !election) {
    notFound();
  }

  // If the user already has a valid voter session for this election, skip ahead
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email?.endsWith("@vsu.edu.ph")) {
    const studentId = user.email.split("@")[0];
    const { data: voter } = await adminSupabase
      .from("voters")
      .select("voter_id, is_voted")
      .eq("election_id", electionId)
      .eq("student_id", studentId)
      .single();

    if (voter && !voter.is_voted) {
      redirect(`/elections/${electionId}/vote`);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-10 px-4 space-y-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to elections
        </Link>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Voter verification</h1>
          <p className="text-muted-foreground">{election.name}</p>
        </div>

        <VoterValidationForm
          electionId={electionId}
          electionName={election.name}
        />
      </div>
    </div>
  );
}
