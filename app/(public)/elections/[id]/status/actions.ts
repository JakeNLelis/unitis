"use server";

import { createClient } from "@/lib/supabase/server";

export async function lookupCandidateStatus(email: string, electionId: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !electionId) {
    return { error: "Email and election ID are required." };
  }

  const supabase = await createClient();

  const query = supabase
    .from("candidates")
    .select(
      `
      candidate_id,
      full_name,
      application_status,
      rejection_reason,
      affiliation_status,
      created_at,
      positions(title),
      courses(name, acronym),
      partylists(name, acronym)
    `,
    )
    .eq("election_id", electionId)
    .eq("email", normalizedEmail)
    .order("created_at", { ascending: false });

  const { data: candidates, error } = await query;

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
