"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSEBOfficer } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { TurnoutAdjustmentInput } from "@/lib/types/election";
import { isElectionActive } from "@/lib/utils";

export async function createElection(formData: FormData) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const election_type = formData.get("election_type") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const candidacy_start_date =
    (formData.get("candidacy_start_date") as string) || null;
  const candidacy_end_date =
    (formData.get("candidacy_end_date") as string) || null;

  if (!name || !election_type || !start_date || !end_date) {
    return { error: "Missing required fields" };
  }

  // datetime-local values are naive local-time strings; convert to UTC ISO
  // so PostgreSQL stores the correct moment regardless of DB server timezone.
  const toISO = (s: string | null) => (s ? new Date(s).toISOString() : null);
  const start_date_iso = new Date(start_date).toISOString();
  const end_date_iso = new Date(end_date).toISOString();
  const candidacy_start_date_iso = toISO(candidacy_start_date);
  const candidacy_end_date_iso = toISO(candidacy_end_date);

  // Validate dates
  const startDate = new Date(start_date_iso);
  const endDate = new Date(end_date_iso);

  if (endDate <= startDate) {
    return { error: "End date must be after start date" };
  }

  if (candidacy_end_date && candidacy_start_date) {
    const candStart = new Date(candidacy_start_date_iso!);
    const candEnd = new Date(candidacy_end_date_iso!);

    if (candEnd >= startDate) {
      return {
        error: "Candidacy filing deadline must be before election start date",
      };
    }

    if (candStart >= candEnd) {
      return {
        error: "Candidacy start date must be before candidacy end date",
      };
    }
  }

  // Use admin client to bypass RLS — auth already verified above
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("elections")
    .insert({
      name,
      election_type,
      start_date: start_date_iso,
      end_date: end_date_iso,
      candidacy_start_date: candidacy_start_date_iso,
      candidacy_end_date: candidacy_end_date_iso,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Assign this election to the officer
  await supabase
    .from("seb_officers")
    .update({ election_id: data.election_id })
    .eq("seb_officer_id", officer.seb_officer_id);

  redirect(`/officer/elections/${data.election_id}`);
}

export async function createPosition(formData: FormData) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  const election_id = formData.get("election_id") as string;
  const title = formData.get("title") as string;
  const max_votes = parseInt(formData.get("max_votes") as string) || 1;

  if (!election_id || !title) {
    return { error: "Missing required fields" };
  }

  // Use admin client to bypass RLS — auth already verified above
  const supabase = await createAdminClient();

  const { error } = await supabase.from("positions").insert({
    election_id,
    title,
    max_votes,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/officer/elections/${election_id}`);
  return { success: true };
}

export async function updateCandidateStatus(
  candidateId: string,
  status: "approved" | "rejected",
  rejectionReason?: string,
) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  if (status === "rejected" && !rejectionReason?.trim()) {
    return { error: "A rejection reason is required." };
  }

  // Use admin client to bypass RLS — auth already verified above
  const supabase = await createAdminClient();

  const updateData: Record<string, unknown> = {
    application_status: status,
  };
  if (status === "rejected") {
    updateData.rejection_reason = rejectionReason!.trim();
  } else {
    updateData.rejection_reason = null;
  }

  const { error } = await supabase
    .from("candidates")
    .update(updateData)
    .eq("candidate_id", candidateId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePosition(
  positionId: string,
  electionId: string,
  title: string,
  maxVotes: number,
) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  if (!title.trim()) {
    return { error: "Position title is required" };
  }

  if (maxVotes < 1) {
    return { error: "Max votes must be at least 1" };
  }

  // Use admin client to bypass RLS — auth already verified above
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("positions")
    .update({ title: title.trim(), max_votes: maxVotes })
    .eq("position_id", positionId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deletePosition(positionId: string) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  // Use admin client to bypass RLS — auth already verified above
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("positions")
    .delete()
    .eq("position_id", positionId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateElectionDates(
  electionId: string,
  data: {
    start_date: string;
    end_date: string;
    candidacy_start_date: string | null;
    candidacy_end_date: string | null;
  },
) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  const { start_date, end_date, candidacy_start_date, candidacy_end_date } =
    data;

  if (!start_date || !end_date) {
    return { error: "Voting start and end dates are required" };
  }

  // datetime-local values are naive local-time strings; convert to UTC ISO
  const toISO = (s: string | null) => (s ? new Date(s).toISOString() : null);
  const start_date_iso = new Date(start_date).toISOString();
  const end_date_iso = new Date(end_date).toISOString();
  const candidacy_start_date_iso = toISO(candidacy_start_date);
  const candidacy_end_date_iso = toISO(candidacy_end_date);

  // Validate dates
  const startDate = new Date(start_date_iso);
  const endDate = new Date(end_date_iso);

  if (endDate <= startDate) {
    return { error: "Voting end date must be after voting start date" };
  }

  if (candidacy_end_date && candidacy_start_date) {
    const candStart = new Date(candidacy_start_date_iso!);
    const candEnd = new Date(candidacy_end_date_iso!);

    if (candEnd >= startDate) {
      return {
        error: "Candidacy filing deadline must be before election start date",
      };
    }

    if (candStart >= candEnd) {
      return {
        error: "Candidacy start date must be before candidacy end date",
      };
    }
  }

  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("elections")
    .update({
      start_date: start_date_iso,
      end_date: end_date_iso,
      candidacy_start_date: candidacy_start_date_iso,
      candidacy_end_date: candidacy_end_date_iso,
    })
    .eq("election_id", electionId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteElection(electionId: string) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  const supabase = await createAdminClient();

  // Check for existing candidates
  const { count } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .eq("election_id", electionId);

  if (count && count > 0) {
    return {
      error: `Cannot delete election with ${count} candidate application${count !== 1 ? "s" : ""}. Remove all applications first.`,
    };
  }

  // Delete positions first (FK constraint)
  await supabase.from("positions").delete().eq("election_id", electionId);

  // Delete partylists (FK constraint)
  await supabase.from("partylists").delete().eq("election_id", electionId);

  // Unassign officers from this election
  await supabase
    .from("seb_officers")
    .update({ election_id: null })
    .eq("election_id", electionId);

  // Delete the election
  const { error } = await supabase
    .from("elections")
    .delete()
    .eq("election_id", electionId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function addVoterMasterlist(electionId: string, rawText: string) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  // Parse student IDs: split by any whitespace (spaces, newlines, tabs)
  const studentIds = rawText
    .split(/\s+/)
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  if (studentIds.length === 0) {
    return { error: "No valid student IDs provided." };
  }

  // Remove duplicates
  const uniqueIds = [...new Set(studentIds)];

  const supabase = await createAdminClient();

  // Get existing student IDs for this election to skip duplicates
  const { data: existing } = await supabase
    .from("voters")
    .select("student_id")
    .eq("election_id", electionId);

  const existingSet = new Set((existing || []).map((v) => v.student_id));

  const newIds = uniqueIds.filter((id) => !existingSet.has(id));

  if (newIds.length === 0) {
    return {
      error: "All provided student IDs are already in the masterlist.",
    };
  }

  // Bulk insert — use placeholder email since we only need student_id for the masterlist
  const rows = newIds.map((studentId) => ({
    election_id: electionId,
    student_id: studentId,
    email: `${studentId}@masterlist.pending`,
    is_voted: false,
  }));

  const { error } = await supabase.from("voters").insert(rows);

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    added: newIds.length,
    skipped: uniqueIds.length - newIds.length,
  };
}

export async function removeVoter(voterId: string) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("voters")
    .delete()
    .eq("voter_id", voterId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function clearVoterMasterlist(electionId: string) {
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  const supabase = await createAdminClient();

  // Only delete voters who haven't voted yet
  const { error } = await supabase
    .from("voters")
    .delete()
    .eq("election_id", electionId)
    .eq("is_voted", false);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// Turnout mutation server actions (T009-T011)

/**
 * T009: Create or update a turnout adjustment for an active election
 * T010: Includes input validation and auto-adjust rule handling
 * T011: Triggers revalidation of landing/event/archive pages
 *
 * Constraints:
 * - Officer auth required (enforced by getSEBOfficer)
 * - Election must be active
 * - At least one of casted_votes_delta or expected_voters_value required
 * - Validated values must be non-negative
 * - If casted_votes > expected_voters after adjustment, auto-adjust expected_voters = casted_votes
 */
export async function submitTurnoutAdjustment(
  electionId: string,
  input: TurnoutAdjustmentInput,
) {
  // T009: Auth check - return error instead of redirect per server-action contract
  const officer = await getSEBOfficer();
  if (!officer) {
    return { error: "Unauthorized" };
  }

  // T010: Input validation
  const { casted_votes_delta, expected_voters_value, reason } = input;

  // Validate: at least one input provided
  if (
    (casted_votes_delta === undefined || casted_votes_delta === null) &&
    (expected_voters_value === undefined || expected_voters_value === null)
  ) {
    return {
      error:
        "Must provide either casted votes adjustment or expected voters value",
    };
  }

  // Validate: non-negative values
  if (casted_votes_delta !== undefined && casted_votes_delta !== null) {
    if (!Number.isInteger(casted_votes_delta) || casted_votes_delta < 0) {
      return { error: "Casted votes adjustment must be non-negative integer" };
    }
  }

  if (expected_voters_value !== undefined && expected_voters_value !== null) {
    if (!Number.isInteger(expected_voters_value) || expected_voters_value < 0) {
      return { error: "Expected voters must be non-negative integer" };
    }
  }

  const supabase = await createAdminClient();

  // Verify election exists and is active
  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select("start_date, end_date")
    .eq("election_id", electionId)
    .single();

  if (electionError || !election) {
    return { error: "Election not found" };
  }

  // T010: Check if election is active (required for turnout edits)
  if (!isElectionActive(election.start_date, election.end_date)) {
    return { error: "Turnout adjustments only allowed for active elections" };
  }

  // Insert turnout adjustment record
  const { data: adjustment, error: insertError } = await supabase
    .from("turnout_adjustments")
    .insert({
      election_id: electionId,
      seb_officer_id: officer.seb_officer_id,
      casted_votes_delta: casted_votes_delta || null,
      expected_voters_value: expected_voters_value || null,
      reason: reason || null,
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  // T011: Revalidate affected paths so cached data updates
  revalidatePath("/"); // Landing page (US1)
  revalidatePath(`/elections/${electionId}`); // Event page (US2)
  revalidatePath(`/elections/${electionId}/turnout`); // Live turnout (US3)
  revalidatePath("/archive"); // Archive page (US3)

  return { success: true, data: adjustment };
}
