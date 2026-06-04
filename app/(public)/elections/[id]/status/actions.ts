"use server";

import { createClient } from "@/lib/supabase/server";

export async function lookupCandidateStatus(email: string, electionId: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !electionId) {
    return { error: "Email and election ID are required." };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return { error: "You must be authenticated to check status." };
  }

  const authUserEmail = user.email.trim().toLowerCase();

  // Enforce manager check using the logged-in user's email
  const { data: managedPartylists } = await supabase
    .from("partylists")
    .select("partylist_id")
    .eq("election_id", electionId)
    .eq("representative_email", authUserEmail);

  const managedPartylistIds = (managedPartylists || []).map(
    (item) => item.partylist_id,
  );

  const isManager = managedPartylistIds.length > 0;
  const isSelf = authUserEmail === normalizedEmail;

  if (!isSelf && !isManager) {
    return { error: "Access denied. You can only view your own status or your partylist candidates." };
  }

  let query = supabase
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
    .order("created_at", { ascending: false });

  if (isManager) {
    query = query.in("partylist_id", managedPartylistIds);
  } else {
    query = query.eq("email", normalizedEmail);
  }

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
