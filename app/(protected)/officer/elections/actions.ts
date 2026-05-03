"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { TurnoutAdjustmentInput } from "@/lib/types/election";
import { isElectionActive, isValidStudentId } from "@/lib/utils";
import {
  canActorCreateElectionType,
  getElectionPermissionsForActor,
} from "@/lib/election-permissions";
import type {
  ActionActor,
  ElectionContext,
  ElectionAccessPolicyRow,
  ElectionActor,
} from "@/lib/types/auth";
import {
  requireActionActor,
  getElectionContextForActor,
  requireEditableElectionContext,
  validateTurnoutAdjustmentInput,
  insertTurnoutAdjustmentRecord,
  getElectionDependencyIds,
  deleteVoteSelectionsForCandidates,
  deleteVotesAndSelectionsForVoters,
  deleteElectionScopedRows,
  getPositionById,
  getVoterById,
  revalidateElectionManagementPaths,
} from "@/app/_helpers/elections/officer-actions";

export async function createElection(formData: FormData) {
  const actorResult = await requireActionActor();
  if ("error" in actorResult) {
    return actorResult;
  }

  const actor = actorResult;

  const name = formData.get("name") as string;
  const election_type = formData.get("election_type") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const candidacy_start_date =
    (formData.get("candidacy_start_date") as string) || null;
  const candidacy_end_date =
    (formData.get("candidacy_end_date") as string) || null;
  const requestedRedirectBase = (formData.get("redirect_base") as string) || "";

  if (!name || !election_type || !start_date || !end_date) {
    return { error: "Missing required fields" };
  }

  const redirectBase =
    requestedRedirectBase === "/admin/elections"
      ? "/admin/elections"
      : "/officer/elections";

  if (!canActorCreateElectionType(actor.role, election_type)) {
    return {
      error:
        actor.role === "system-admin"
          ? "System administrators can only create university-wide elections."
          : "SEB officers can only create faculty-wide elections.",
    };
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

  const electionTypeNormalized = election_type.trim().toLowerCase();
  const scopeCampus =
    actor.role === "seb-officer" ? actor.officer?.campus : null;
  const scopeFacultyCode =
    actor.role === "seb-officer" ? actor.officer?.faculty_code : null;

  const { data, error } = await supabase
    .from("elections")
    .insert({
      name,
      election_type,
      created_by:
        actor.role === "seb-officer" ? actor.officer?.seb_officer_id : null,
      created_by_admin_id:
        actor.role === "system-admin" ? actor.systemAdminId : null,
      owner_campus:
        electionTypeNormalized === "university-wide" ? null : scopeCampus,
      owner_faculty_code:
        electionTypeNormalized === "faculty-wide" ? scopeFacultyCode : null,
      access_policy_locked: true,
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

  if (actor.role === "seb-officer" && actor.officer) {
    // Keep the creator officer linked to the election for existing workflows.
    await supabase
      .from("seb_officers")
      .update({ election_id: data.election_id })
      .eq("seb_officer_id", actor.officer.seb_officer_id);
  }

  redirect(`${redirectBase}/${data.election_id}`);
}

export async function createPosition(formData: FormData) {
  const actorResult = await requireActionActor();
  if ("error" in actorResult) {
    return actorResult;
  }

  const election_id = formData.get("election_id") as string;
  const title = formData.get("title") as string;
  const max_votes = parseInt(formData.get("max_votes") as string) || 1;

  if (!election_id || !title) {
    return { error: "Missing required fields" };
  }

  const permissionContext = await requireEditableElectionContext(
    election_id,
    actorResult,
    { requireUpcoming: true },
  );
  if ("error" in permissionContext) {
    return permissionContext;
  }

  const supabase = await createAdminClient();

  const { error } = await supabase.from("positions").insert({
    election_id,
    title,
    max_votes,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateElectionManagementPaths(election_id);
  return { success: true };
}

export async function updateCandidateStatus(
  candidateId: string,
  status: "approved" | "rejected",
  rejectionReason?: string,
) {
  const actorResult = await requireActionActor();
  if ("error" in actorResult) {
    return actorResult;
  }

  const actor = actorResult;

  if (status === "rejected" && !rejectionReason?.trim()) {
    return { error: "A rejection reason is required." };
  }

  const supabase = await createAdminClient();

  const { data: candidateRow, error: candidateFetchError } = await supabase
    .from("candidates")
    .select(
      "candidate_id, election_id, application_status, approved_by_display, approved_at",
    )
    .eq("candidate_id", candidateId)
    .single();

  if (candidateFetchError || !candidateRow) {
    return { error: "Candidate not found" };
  }

  if (candidateRow.application_status !== "pending") {
    const approvedBy = candidateRow.approved_by_display
      ? ` by ${candidateRow.approved_by_display}`
      : "";
    const approvedAt = candidateRow.approved_at
      ? ` on ${new Date(candidateRow.approved_at).toLocaleString()}`
      : "";
    return {
      error: `Candidate already ${candidateRow.application_status}${approvedBy}${approvedAt}.`,
      code: "candidate_already_processed",
      currentStatus: candidateRow.application_status,
      approvedByDisplay: candidateRow.approved_by_display,
      approvedAt: candidateRow.approved_at,
    };
  }

  const permissionContext = await getElectionContextForActor(
    candidateRow.election_id,
    actor,
  );

  if ("error" in permissionContext) {
    return { error: permissionContext.error };
  }

  if (!permissionContext.permissions.canApprove) {
    return {
      error:
        "Forbidden: You do not have permission to approve candidates for this election.",
    };
  }

  const updateData: Record<string, unknown> = {
    application_status: status,
  };
  if (status === "rejected") {
    updateData.rejection_reason = rejectionReason!.trim();
    updateData.approved_by_user_id = null;
    updateData.approved_by_role = null;
    updateData.approved_by_display = null;
    updateData.approved_at = null;
  } else {
    updateData.rejection_reason = null;
    updateData.approved_by_user_id = actor.userId;
    updateData.approved_by_role = actor.role;
    updateData.approved_by_display = actor.displayName;
    updateData.approved_at = new Date().toISOString();
  }

  const { data: updatedRows, error } = await supabase
    .from("candidates")
    .update(updateData)
    .eq("candidate_id", candidateId)
    .eq("application_status", "pending")
    .select("candidate_id");

  if (error) {
    return { error: error.message };
  }

  if (!updatedRows || updatedRows.length === 0) {
    const { data: latest } = await supabase
      .from("candidates")
      .select("application_status, approved_by_display, approved_at")
      .eq("candidate_id", candidateId)
      .single();

    const approvedBy = latest?.approved_by_display
      ? ` by ${latest.approved_by_display}`
      : "";
    const approvedAt = latest?.approved_at
      ? ` on ${new Date(latest.approved_at).toLocaleString()}`
      : "";
    return {
      error: `Candidate already ${latest?.application_status ?? "processed"}${approvedBy}${approvedAt}.`,
      code: "candidate_already_processed",
      currentStatus: latest?.application_status,
      approvedByDisplay: latest?.approved_by_display,
      approvedAt: latest?.approved_at,
    };
  }

  return { success: true };
}

export async function updatePosition(
  positionId: string,
  electionId: string,
  title: string,
  maxVotes: number,
) {
  const actorResult = await requireActionActor();
  if ("error" in actorResult) {
    return actorResult;
  }

  if (!title.trim()) {
    return { error: "Position title is required" };
  }

  if (maxVotes < 1) {
    return { error: "Max votes must be at least 1" };
  }

  const supabase = await createAdminClient();

  const positionResult = await getPositionById(positionId);
  if ("error" in positionResult) {
    return positionResult;
  }

  if (positionResult.election_id !== electionId) {
    return { error: "Invalid election context for position." };
  }

  const permissionContext = await requireEditableElectionContext(
    positionResult.election_id,
    actorResult,
    { requireUpcoming: true },
  );
  if ("error" in permissionContext) {
    return permissionContext;
  }

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
  const actorResult = await requireActionActor();
  if ("error" in actorResult) {
    return actorResult;
  }

  const supabase = await createAdminClient();

  const positionResult = await getPositionById(positionId);
  if ("error" in positionResult) {
    return positionResult;
  }

  const permissionContext = await requireEditableElectionContext(
    positionResult.election_id,
    actorResult,
    { requireUpcoming: true },
  );

  if ("error" in permissionContext) {
    return permissionContext;
  }

  const { error } = await supabase
    .from("positions")
    .delete()
    .eq("position_id", positionId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePartylistRequiredPositions(
  electionId: string,
  requiredPositionIds: string[],
) {
  const actorResult = await requireActionActor();
  if ("error" in actorResult) {
    return actorResult;
  }

  const permissionContext = await requireEditableElectionContext(
    electionId,
    actorResult,
    { requireUpcoming: true },
  );
  if ("error" in permissionContext) {
    return permissionContext;
  }

  const supabase = await createAdminClient();
  const distinctRequiredIds = [...new Set(requiredPositionIds)];

  const { data: electionPositions, error: positionsError } = await supabase
    .from("positions")
    .select("position_id")
    .eq("election_id", electionId);

  if (positionsError) {
    return { error: positionsError.message };
  }

  const validPositionIds = new Set(
    (electionPositions || []).map((item) => item.position_id),
  );

  const hasInvalidPositionId = distinctRequiredIds.some(
    (positionId) => !validPositionIds.has(positionId),
  );

  if (hasInvalidPositionId) {
    return { error: "One or more selected positions are invalid." };
  }

  const { error: resetError } = await supabase
    .from("positions")
    .update({ required_for_partylist: false })
    .eq("election_id", electionId);

  if (resetError) {
    return { error: resetError.message };
  }

  if (distinctRequiredIds.length > 0) {
    const { error: markError } = await supabase
      .from("positions")
      .update({ required_for_partylist: true })
      .in("position_id", distinctRequiredIds);

    if (markError) {
      return { error: markError.message };
    }
  }

  revalidateElectionManagementPaths(electionId);
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
  const actorResult = await requireActionActor();
  if ("error" in actorResult) {
    return actorResult;
  }

  const permissionContext = await requireEditableElectionContext(
    electionId,
    actorResult,
  );
  if ("error" in permissionContext) {
    return permissionContext;
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
  const actorResult = await requireActionActor();
  if ("error" in actorResult) {
    return actorResult;
  }

  const permissionContext = await getElectionContextForActor(
    electionId,
    actorResult,
  );
  if ("error" in permissionContext) {
    return { error: permissionContext.error };
  }

  if (!permissionContext.permissions.canDelete) {
    return {
      error: "Forbidden: You do not have permission to delete this election.",
    };
  }

  const supabase = await createAdminClient();

  const dependencyIdsResult = await getElectionDependencyIds(electionId);
  if ("error" in dependencyIdsResult) {
    return { error: dependencyIdsResult.error };
  }

  const candidateSelectionsDeleteError =
    await deleteVoteSelectionsForCandidates(dependencyIdsResult.candidateIds);
  if (candidateSelectionsDeleteError) {
    return { error: candidateSelectionsDeleteError };
  }

  const voterVotesDeleteError = await deleteVotesAndSelectionsForVoters(
    dependencyIdsResult.voterIds,
  );
  if (voterVotesDeleteError) {
    return { error: voterVotesDeleteError };
  }

  const scopedRowsDeleteError = await deleteElectionScopedRows(electionId);
  if (scopedRowsDeleteError) {
    return { error: scopedRowsDeleteError };
  }

  const { error: unassignOfficersError } = await supabase
    .from("seb_officers")
    .update({ election_id: null })
    .eq("election_id", electionId);

  if (unassignOfficersError) {
    return { error: unassignOfficersError.message };
  }

  const { error: electionDeleteError } = await supabase
    .from("elections")
    .delete()
    .eq("election_id", electionId);

  if (electionDeleteError) {
    return { error: electionDeleteError.message };
  }

  revalidatePath("/officer/elections");
  revalidatePath("/admin/elections");
  revalidateElectionManagementPaths(electionId);

  return { success: true };
}

export async function addVoterMasterlist(electionId: string, rawText: string) {
  const actorResult = await requireActionActor();
  if ("error" in actorResult) {
    return actorResult;
  }

  const permissionContext = await requireEditableElectionContext(
    electionId,
    actorResult,
    { requireUpcoming: true },
  );
  if ("error" in permissionContext) {
    return permissionContext;
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

  const invalidIds = uniqueIds.filter((id) => !isValidStudentId(id));
  if (invalidIds.length > 0) {
    return {
      error:
        `Invalid student ID format for: ${invalidIds.slice(0, 5).join(", ")}` +
        `${invalidIds.length > 5 ? " ..." : ""}. Use xx-x-xxxxx (e.g. 23-1-01457).`,
    };
  }

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
  const actorResult = await requireActionActor();
  if ("error" in actorResult) {
    return actorResult;
  }

  const supabase = await createAdminClient();

  const voterResult = await getVoterById(voterId);
  if ("error" in voterResult) {
    return voterResult;
  }

  const permissionContext = await requireEditableElectionContext(
    voterResult.election_id,
    actorResult,
    { requireUpcoming: true },
  );

  if ("error" in permissionContext) {
    return permissionContext;
  }

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
  const actorResult = await requireActionActor();
  if ("error" in actorResult) {
    return actorResult;
  }

  const permissionContext = await requireEditableElectionContext(
    electionId,
    actorResult,
    { requireUpcoming: true },
  );
  if ("error" in permissionContext) {
    return permissionContext;
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
 * - Election manager auth required (SEB officer or system admin)
 * - Actor must have edit rights on target election
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
  const actorResult = await requireActionActor();
  if ("error" in actorResult) {
    return actorResult;
  }

  const permissionContext = await requireEditableElectionContext(
    electionId,
    actorResult,
  );
  if ("error" in permissionContext) {
    return permissionContext;
  }

  // T010: Input validation
  const inputValidationError = validateTurnoutAdjustmentInput(input);
  if (inputValidationError) {
    return { error: inputValidationError };
  }

  const supabase = await createAdminClient();

  const election = permissionContext.election;

  // T010: Check if election is active (required for turnout edits)
  if (!isElectionActive(election.start_date, election.end_date)) {
    return { error: "Turnout adjustments only allowed for active elections" };
  }

  // Insert turnout adjustment record
  const { data: adjustment, error: insertError } =
    await insertTurnoutAdjustmentRecord(electionId, actorResult, input);

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
