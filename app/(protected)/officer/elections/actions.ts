"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile, getSEBOfficer, getSystemAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { TurnoutAdjustmentInput } from "@/lib/types/election";
import { isElectionActive } from "@/lib/utils";
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

async function getActionActor(): Promise<ActionActor | null> {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  if (profile.role === "seb-officer") {
    const officer = await getSEBOfficer();
    if (!officer) return null;

    return {
      role: "seb-officer",
      userId: profile.id,
      displayName: `${officer.faculty_code} (${officer.campus})`,
      officer: {
        seb_officer_id: officer.seb_officer_id,
        campus: officer.campus,
        faculty_code: officer.faculty_code,
      },
      systemAdminId: null,
    };
  }

  if (profile.role === "system-admin") {
    const admin = await getSystemAdmin();
    if (!admin) return null;

    return {
      role: "system-admin",
      userId: profile.id,
      displayName: admin.username || profile.display_name,
      officer: null,
      systemAdminId: admin.system_admin_id,
    };
  }

  return null;
}

function toElectionActor(actor: ActionActor): ElectionActor {
  return {
    role: actor.role,
    officer: actor.officer,
  };
}

function toAccessPolicyRow(election: ElectionContext): ElectionAccessPolicyRow {
  return {
    election_type: election.election_type,
    created_by: election.created_by,
    owner_campus: election.owner_campus,
    owner_faculty_code: election.owner_faculty_code,
    access_policy_locked: election.access_policy_locked,
  };
}

async function getElectionContextForActor(
  electionId: string,
  actor: ActionActor,
): Promise<
  | {
      election: ElectionContext;
      permissions: ReturnType<typeof getElectionPermissionsForActor>;
    }
  | { error: string }
> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("elections")
    .select(
      "election_id, election_type, created_by, owner_campus, owner_faculty_code, access_policy_locked, start_date, end_date",
    )
    .eq("election_id", electionId)
    .single();

  if (error || !data) {
    return { error: "Election not found" };
  }

  const election = data as ElectionContext;
  const permissions = getElectionPermissionsForActor(
    toAccessPolicyRow(election),
    toElectionActor(actor),
  );

  return { election, permissions };
}

export async function createElection(formData: FormData) {
  const actor = await getActionActor();
  if (!actor) {
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
          : "SEB officers can only create campus-wide or faculty-wide elections.",
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
  const actor = await getActionActor();
  if (!actor) {
    return { error: "Unauthorized" };
  }

  const election_id = formData.get("election_id") as string;
  const title = formData.get("title") as string;
  const max_votes = parseInt(formData.get("max_votes") as string) || 1;

  if (!election_id || !title) {
    return { error: "Missing required fields" };
  }

  const permissionContext = await getElectionContextForActor(
    election_id,
    actor,
  );
  if ("error" in permissionContext) {
    return { error: permissionContext.error };
  }

  if (!permissionContext.permissions.canEdit) {
    return {
      error: "Forbidden: You do not have permission to edit this election.",
    };
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

  revalidatePath(`/officer/elections/${election_id}`);
  revalidatePath(`/admin/elections/${election_id}`);
  return { success: true };
}

export async function updateCandidateStatus(
  candidateId: string,
  status: "approved" | "rejected",
  rejectionReason?: string,
) {
  const actor = await getActionActor();
  if (!actor) {
    return { error: "Unauthorized" };
  }

  if (status === "rejected" && !rejectionReason?.trim()) {
    return { error: "A rejection reason is required." };
  }

  const supabase = await createAdminClient();

  const { data: candidateRow, error: candidateFetchError } = await supabase
    .from("candidates")
    .select("candidate_id, election_id")
    .eq("candidate_id", candidateId)
    .single();

  if (candidateFetchError || !candidateRow) {
    return { error: "Candidate not found" };
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
  const actor = await getActionActor();
  if (!actor) {
    return { error: "Unauthorized" };
  }

  if (!title.trim()) {
    return { error: "Position title is required" };
  }

  if (maxVotes < 1) {
    return { error: "Max votes must be at least 1" };
  }

  const supabase = await createAdminClient();

  const { data: position, error: positionError } = await supabase
    .from("positions")
    .select("position_id, election_id")
    .eq("position_id", positionId)
    .single();

  if (positionError || !position) {
    return { error: "Position not found" };
  }

  if (position.election_id !== electionId) {
    return { error: "Invalid election context for position." };
  }

  const permissionContext = await getElectionContextForActor(
    position.election_id,
    actor,
  );
  if ("error" in permissionContext) {
    return { error: permissionContext.error };
  }

  if (!permissionContext.permissions.canEdit) {
    return {
      error: "Forbidden: You do not have permission to edit this election.",
    };
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
  const actor = await getActionActor();
  if (!actor) {
    return { error: "Unauthorized" };
  }

  const supabase = await createAdminClient();

  const { data: position, error: positionError } = await supabase
    .from("positions")
    .select("position_id, election_id")
    .eq("position_id", positionId)
    .single();

  if (positionError || !position) {
    return { error: "Position not found" };
  }

  const permissionContext = await getElectionContextForActor(
    position.election_id,
    actor,
  );

  if ("error" in permissionContext) {
    return { error: permissionContext.error };
  }

  if (!permissionContext.permissions.canEdit) {
    return {
      error: "Forbidden: You do not have permission to edit this election.",
    };
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

export async function updateElectionDates(
  electionId: string,
  data: {
    start_date: string;
    end_date: string;
    candidacy_start_date: string | null;
    candidacy_end_date: string | null;
  },
) {
  const actor = await getActionActor();
  if (!actor) {
    return { error: "Unauthorized" };
  }

  const permissionContext = await getElectionContextForActor(electionId, actor);
  if ("error" in permissionContext) {
    return { error: permissionContext.error };
  }

  if (!permissionContext.permissions.canEdit) {
    return {
      error: "Forbidden: You do not have permission to edit this election.",
    };
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
  const actor = await getActionActor();
  if (!actor) {
    return { error: "Unauthorized" };
  }

  const permissionContext = await getElectionContextForActor(electionId, actor);
  if ("error" in permissionContext) {
    return { error: permissionContext.error };
  }

  if (!permissionContext.permissions.canDelete) {
    return {
      error: "Forbidden: You do not have permission to delete this election.",
    };
  }

  const supabase = await createAdminClient();

  // Gather dependent IDs for cleanup steps that require `in (...)` filters.
  const { data: candidates, error: candidatesFetchError } = await supabase
    .from("candidates")
    .select("candidate_id")
    .eq("election_id", electionId);

  if (candidatesFetchError) {
    return { error: candidatesFetchError.message };
  }

  const candidateIds = (candidates || []).map((row) => row.candidate_id);

  const { data: voters, error: votersFetchError } = await supabase
    .from("voters")
    .select("voter_id")
    .eq("election_id", electionId);

  if (votersFetchError) {
    return { error: votersFetchError.message };
  }

  const voterIds = (voters || []).map((row) => row.voter_id);

  if (candidateIds.length > 0) {
    const { error: voteSelectionsByCandidateDeleteError } = await supabase
      .from("vote_selections")
      .delete()
      .in("candidate_id", candidateIds);

    if (voteSelectionsByCandidateDeleteError) {
      return { error: voteSelectionsByCandidateDeleteError.message };
    }
  }

  if (voterIds.length > 0) {
    const { data: votes, error: votesFetchError } = await supabase
      .from("votes")
      .select("vote_id")
      .in("voter_id", voterIds);

    if (votesFetchError) {
      return { error: votesFetchError.message };
    }

    const voteIds = (votes || []).map((row) => row.vote_id);

    if (voteIds.length > 0) {
      const { error: voteSelectionsByVoteDeleteError } = await supabase
        .from("vote_selections")
        .delete()
        .in("vote_id", voteIds);

      if (voteSelectionsByVoteDeleteError) {
        return { error: voteSelectionsByVoteDeleteError.message };
      }

      const { error: votesDeleteError } = await supabase
        .from("votes")
        .delete()
        .in("vote_id", voteIds);

      if (votesDeleteError) {
        return { error: votesDeleteError.message };
      }
    }
  }

  const { error: turnoutAdjustmentsDeleteError } = await supabase
    .from("turnout_adjustments")
    .delete()
    .eq("election_id", electionId);

  if (turnoutAdjustmentsDeleteError) {
    return { error: turnoutAdjustmentsDeleteError.message };
  }

  const { error: candidatesDeleteError } = await supabase
    .from("candidates")
    .delete()
    .eq("election_id", electionId);

  if (candidatesDeleteError) {
    return { error: candidatesDeleteError.message };
  }

  const { error: votersDeleteError } = await supabase
    .from("voters")
    .delete()
    .eq("election_id", electionId);

  if (votersDeleteError) {
    return { error: votersDeleteError.message };
  }

  const { error: positionsDeleteError } = await supabase
    .from("positions")
    .delete()
    .eq("election_id", electionId);

  if (positionsDeleteError) {
    return { error: positionsDeleteError.message };
  }

  const { error: partylistsDeleteError } = await supabase
    .from("partylists")
    .delete()
    .eq("election_id", electionId);

  if (partylistsDeleteError) {
    return { error: partylistsDeleteError.message };
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
  revalidatePath(`/officer/elections/${electionId}`);
  revalidatePath("/admin/elections");
  revalidatePath(`/admin/elections/${electionId}`);

  return { success: true };
}

export async function addVoterMasterlist(electionId: string, rawText: string) {
  const actor = await getActionActor();
  if (!actor) {
    return { error: "Unauthorized" };
  }

  const permissionContext = await getElectionContextForActor(electionId, actor);
  if ("error" in permissionContext) {
    return { error: permissionContext.error };
  }

  if (!permissionContext.permissions.canEdit) {
    return {
      error: "Forbidden: You do not have permission to edit this election.",
    };
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
  const actor = await getActionActor();
  if (!actor) {
    return { error: "Unauthorized" };
  }

  const supabase = await createAdminClient();

  const { data: voter, error: voterError } = await supabase
    .from("voters")
    .select("voter_id, election_id")
    .eq("voter_id", voterId)
    .single();

  if (voterError || !voter) {
    return { error: "Voter record not found" };
  }

  const permissionContext = await getElectionContextForActor(
    voter.election_id,
    actor,
  );

  if ("error" in permissionContext) {
    return { error: permissionContext.error };
  }

  if (!permissionContext.permissions.canEdit) {
    return {
      error: "Forbidden: You do not have permission to edit this election.",
    };
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
  const actor = await getActionActor();
  if (!actor) {
    return { error: "Unauthorized" };
  }

  const permissionContext = await getElectionContextForActor(electionId, actor);
  if ("error" in permissionContext) {
    return { error: permissionContext.error };
  }

  if (!permissionContext.permissions.canEdit) {
    return {
      error: "Forbidden: You do not have permission to edit this election.",
    };
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
  const actor = await getActionActor();
  if (!actor) {
    return { error: "Unauthorized" };
  }

  const permissionContext = await getElectionContextForActor(electionId, actor);
  if ("error" in permissionContext) {
    return { error: permissionContext.error };
  }

  if (!permissionContext.permissions.canEdit) {
    return {
      error: "Forbidden: You do not have permission to edit this election.",
    };
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

  const election = permissionContext.election;

  // T010: Check if election is active (required for turnout edits)
  if (!isElectionActive(election.start_date, election.end_date)) {
    return { error: "Turnout adjustments only allowed for active elections" };
  }

  // Insert turnout adjustment record
  const { data: adjustment, error: insertError } = await supabase
    .from("turnout_adjustments")
    .insert({
      election_id: electionId,
      seb_officer_id: actor.officer?.seb_officer_id ?? null,
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
