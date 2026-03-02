"use server";

import { createClient } from "@/lib/supabase/server";

export async function lookupCandidateStatus(email: string, electionId: string) {
  if (!email || !electionId) {
    return { error: "Email and election ID are required." };
  }

  const supabase = await createClient();

  const { data: candidates, error } = await supabase
    .from("candidates")
    .select(
      `
      candidate_id,
      full_name,
      student_id,
      email,
      application_status,
      rejection_reason,
      affiliation_status,
      cog_link,
      cor_link,
      good_moral_link,
      created_at,
      positions(title),
      courses(name, acronym),
      partylists(name, acronym)
    `,
    )
    .eq("election_id", electionId)
    .eq("email", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Status lookup error:", error);
    return { error: "Failed to look up your application status." };
  }

  if (!candidates || candidates.length === 0) {
    return {
      error: "No application found with this email address for this election.",
    };
  }

  return { candidates };
}
