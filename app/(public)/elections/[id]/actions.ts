"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTodayStr } from "@/lib/utils";

export async function registerPartylist(formData: FormData) {
  const election_id = formData.get("election_id") as string;
  const name = formData.get("name") as string;
  const acronym = formData.get("acronym") as string;
  const platform = formData.get("platform") as string;
  const registered_by_email = formData.get("registered_by_email") as string;
  const registered_by_name = formData.get("registered_by_name") as string;

  if (
    !election_id ||
    !name ||
    !acronym ||
    !registered_by_email ||
    !registered_by_name
  ) {
    return { error: "Please fill in all required fields." };
  }

  const supabase = await createClient();

  // Verify the election exists and candidacy period is open
  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select(
      "election_id, candidacy_start_date, candidacy_end_date, is_archived",
    )
    .eq("election_id", election_id)
    .single();

  if (electionError || !election) {
    return { error: "Election not found." };
  }

  if (election.is_archived) {
    return { error: "This election has been archived." };
  }

  // Use string-based date comparison to avoid UTC timezone mismatch
  const today = getTodayStr();
  const candStart = election.candidacy_start_date?.slice(0, 10) ?? null;
  const candEnd = election.candidacy_end_date?.slice(0, 10) ?? null;
  if (!candStart || !candEnd || today < candStart || today > candEnd) {
    return {
      error:
        "Partylist registration is only available during the candidacy filing period.",
    };
  }

  // Use admin client for insert to bypass RLS edge cases
  const adminSupabase = await createAdminClient();

  // Check if acronym or name already used in this election
  const { data: existingAcronym } = await adminSupabase
    .from("partylists")
    .select("partylist_id")
    .eq("election_id", election_id)
    .eq("acronym", acronym.toUpperCase());

  if (existingAcronym && existingAcronym.length > 0) {
    return {
      error:
        "This partylist acronym is already registered for this event. Please choose a unique identifier.",
    };
  }

  const { data: existingName } = await adminSupabase
    .from("partylists")
    .select("partylist_id")
    .eq("election_id", election_id)
    .eq("name", name);

  if (existingName && existingName.length > 0) {
    return {
      error: "A partylist with this name is already registered for this event.",
    };
  }

  const { error: insertError } = await adminSupabase.from("partylists").insert({
    election_id,
    name,
    acronym: acronym.toUpperCase(),
    platform: platform || null,
    registered_by_email,
    registered_by_name,
  });

  if (insertError) {
    console.error("Partylist insert error:", insertError);
    return { error: "Failed to register partylist. Please try again." };
  }

  return { success: true };
}

export async function updateAffiliationStatus(
  candidateId: string,
  status: "verified" | "rejected",
) {
  // Auth check: verify the caller is logged in
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!user) return { error: "You must be logged in to perform this action." };

  const adminSupabase = await createAdminClient();

  // Verify the caller is the partylist rep for this candidate's partylist
  const { data: candidate } = await adminSupabase
    .from("candidates")
    .select("partylist_id, partylists(registered_by_email)")
    .eq("candidate_id", candidateId)
    .single();

  if (!candidate || !candidate.partylist_id) {
    return { error: "Candidate is not affiliated with a partylist." };
  }

  const partylist = candidate.partylists as unknown as {
    registered_by_email: string;
  } | null;
  if (
    !partylist ||
    partylist.registered_by_email.toLowerCase() !== user.email?.toLowerCase()
  ) {
    return {
      error: "Only the partylist representative can manage affiliations.",
    };
  }

  const updateData: Record<string, unknown> = {
    affiliation_status: status,
  };

  // If rejected, revert to independent (remove partylist)
  if (status === "rejected") {
    updateData.partylist_id = null;
  }

  const { error } = await adminSupabase
    .from("candidates")
    .update(updateData)
    .eq("candidate_id", candidateId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
