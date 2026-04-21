"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDateTimeWindowStatus } from "@/lib/utils";
import {
  getPartylistRegistrationInput,
  getOpenElectionForPartylistRegistration,
  hasExistingPartylist,
} from "@/app/_helpers/elections/register-partylist";

// @CodeScene(disable:"Complex Method")
export async function registerPartylist(formData: FormData) {
  const input = getPartylistRegistrationInput(formData);
  if ("error" in input) {
    return input;
  }

  const {
    election_id,
    name,
    acronym,
    platform,
    registered_by_email,
    registered_by_name,
  } = input;

  // Verify the election exists and candidacy period is open
  const { data: election, error: electionError } =
    await getOpenElectionForPartylistRegistration(election_id);

  if (electionError || !election) {
    return { error: "Election not found." };
  }

  if (election.is_archived) {
    return { error: "This election has been archived." };
  }

  if (
    getDateTimeWindowStatus(
      election.candidacy_start_date,
      election.candidacy_end_date,
    ) !== "open"
  ) {
    return {
      error:
        "Partylist registration is only available during the candidacy filing period.",
    };
  }

  // Use admin client for insert to bypass RLS edge cases
  // Check if acronym or name already used in this election
  if (
    await hasExistingPartylist(election_id, "acronym", acronym.toUpperCase())
  ) {
    return {
      error:
        "This partylist acronym is already registered for this event. Please choose a unique identifier.",
    };
  }

  if (await hasExistingPartylist(election_id, "name", name)) {
    return {
      error: "A partylist with this name is already registered for this event.",
    };
  }

  const adminSupabase = await createAdminClient();

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
