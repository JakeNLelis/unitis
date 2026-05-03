"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDateTimeWindowStatus } from "@/lib/utils";
import {
  getPartylistRegistrationInput,
  getRequiredPartylistPositionIds,
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
    candidate_slate,
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

  if (
    await hasExistingPartylist(
      election_id,
      "representative_email",
      registered_by_email.toLowerCase(),
    )
  ) {
    return {
      error: "This email is already assigned as a partylist manager.",
    };
  }

  const requiredPositionsResult =
    await getRequiredPartylistPositionIds(election_id);
  if ("error" in requiredPositionsResult) {
    return requiredPositionsResult;
  }

  const candidatePositionIds = new Set(
    candidate_slate.map((candidate) => candidate.position_id),
  );

  const missingRequiredPosition = requiredPositionsResult.positionIds.find(
    (positionId) => !candidatePositionIds.has(positionId),
  );

  if (missingRequiredPosition) {
    return {
      error:
        "Partylist registration is incomplete. Please encode candidates for all required positions.",
    };
  }

  const duplicateByPosition = new Set<string>();
  for (const candidate of candidate_slate) {
    const key = `${candidate.position_id}:${candidate.student_id.toLowerCase()}`;
    if (duplicateByPosition.has(key)) {
      return {
        error:
          "Duplicate candidate entry detected for the same position and student ID.",
      };
    }
    duplicateByPosition.add(key);
  }

  const adminSupabase = await createAdminClient();

  const { data: insertedPartylist, error: insertError } = await adminSupabase
    .from("partylists")
    .insert({
      election_id,
      name,
      acronym: acronym.toUpperCase(),
      platform: platform || null,
      representative_email: registered_by_email.toLowerCase(),
      representative_name: registered_by_name,
    })
    .select("partylist_id")
    .single();

  if (insertError || !insertedPartylist) {
    console.error("Partylist insert error:", insertError);
    return { error: "Failed to register partylist. Please try again." };
  }

  const candidateRows = candidate_slate.map((candidate) => ({
    election_id,
    position_id: candidate.position_id,
    course_id: candidate.course_id,
    full_name: candidate.full_name,
    student_id: candidate.student_id,
    email: candidate.email.toLowerCase(),
    age: candidate.age ? parseInt(candidate.age, 10) : null,
    birth_date: candidate.birth_date || null,
    current_address: candidate.current_address || null,
    permanent_address: candidate.permanent_address || null,
    cog_link: candidate.cog_link || null,
    cor_link: candidate.cor_link || null,
    good_moral_link: candidate.good_moral_link || null,
    application_status: "pending",
    partylist_id: insertedPartylist.partylist_id,
    affiliation_status: "verified",
    user_id: null,
    photo: candidate.photo || null,
    contact_number: candidate.contact_number || null,
    faculty: candidate.faculty || null,
    department: candidate.department || null,
    campaign_manager: registered_by_name,
  }));

  const { error: candidatesInsertError } = await adminSupabase
    .from("candidates")
    .insert(candidateRows);

  if (candidatesInsertError) {
    console.error("Partylist candidates insert error:", candidatesInsertError);

    await adminSupabase
      .from("partylists")
      .delete()
      .eq("partylist_id", insertedPartylist.partylist_id);

    return {
      error:
        "Partylist was created but candidate entries failed validation. Please review candidate details and retry.",
    };
  }

  return { success: true, partylist_id: insertedPartylist.partylist_id };
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
    .select("partylist_id, partylists(representative_email)")
    .eq("candidate_id", candidateId)
    .single();

  if (!candidate || !candidate.partylist_id) {
    return { error: "Candidate is not affiliated with a partylist." };
  }

  const partylist = candidate.partylists as unknown as {
    representative_email: string;
  } | null;
  if (
    !partylist ||
    partylist.representative_email.toLowerCase() !== user.email?.toLowerCase()
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
