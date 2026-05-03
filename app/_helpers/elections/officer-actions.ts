import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile, getSEBOfficer, getSystemAdmin } from "@/lib/auth";
import type { TurnoutAdjustmentInput } from "@/lib/types/election";
import type {
  ActionActor,
  ElectionContext,
  ElectionAccessPolicyRow,
  ElectionActor,
} from "@/lib/types/auth";
import { getElectionPermissionsForActor } from "@/lib/election-permissions";
import { isElectionUpcoming } from "@/lib/utils";

export type AdminSupabaseClient = Awaited<ReturnType<typeof createAdminClient>>;
export type ActionError = { error: string };
export type ElectionPermissionContext = {
  election: ElectionContext;
  permissions: ReturnType<typeof getElectionPermissionsForActor>;
};

const UNAUTHORIZED_ERROR = "Unauthorized";
const FORBIDDEN_EDIT_ERROR =
  "Forbidden: You do not have permission to edit this election.";
const MASTERLIST_LOCKED_ERROR =
  "Voter masterlist updates are locked once voting has started.";

export function toError(error: string): ActionError {
  return { error };
}

export async function requireActionActor(): Promise<ActionActor | ActionError> {
  const actor = await getActionActor();
  return actor ?? toError(UNAUTHORIZED_ERROR);
}

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

export async function getElectionContextForActor(
  electionId: string,
  actor: ActionActor,
): Promise<ElectionPermissionContext | ActionError> {
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

export async function requireEditableElectionContext(
  electionId: string,
  actor: ActionActor,
  options?: { requireUpcoming?: boolean },
): Promise<ElectionPermissionContext | ActionError> {
  const permissionContext = await getElectionContextForActor(electionId, actor);
  if ("error" in permissionContext) {
    return permissionContext;
  }

  if (!permissionContext.permissions.canEdit) {
    return toError(FORBIDDEN_EDIT_ERROR);
  }

  if (
    options?.requireUpcoming &&
    !isElectionUpcoming(permissionContext.election.start_date)
  ) {
    return toError(MASTERLIST_LOCKED_ERROR);
  }

  return permissionContext;
}

export function validateNonNegativeInteger(
  value: number | null | undefined,
  label: string,
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value < 0) {
    return `${label} must be non-negative integer`;
  }

  return null;
}

export function validateTurnoutAdjustmentInput(
  input: TurnoutAdjustmentInput,
): string | null {
  if (input.casted_votes_delta == null && input.expected_voters_value == null) {
    return "Must provide either casted votes adjustment or expected voters value";
  }

  const castedVotesError = validateNonNegativeInteger(
    input.casted_votes_delta,
    "Casted votes adjustment",
  );
  if (castedVotesError) {
    return castedVotesError;
  }

  return validateNonNegativeInteger(
    input.expected_voters_value,
    "Expected voters",
  );
}

export async function insertTurnoutAdjustmentRecord(
  electionId: string,
  actor: ActionActor,
  input: TurnoutAdjustmentInput,
) {
  const supabase = await createAdminClient();

  return supabase
    .from("turnout_adjustments")
    .insert({
      election_id: electionId,
      seb_officer_id: actor.officer?.seb_officer_id ?? null,
      casted_votes_delta: input.casted_votes_delta || null,
      expected_voters_value: input.expected_voters_value || null,
      reason: input.reason || null,
    })
    .select()
    .single();
}

export async function getElectionDependencyIds(electionId: string) {
  const supabase = await createAdminClient();

  const { data: candidates, error: candidatesFetchError } = await supabase
    .from("candidates")
    .select("candidate_id")
    .eq("election_id", electionId);

  if (candidatesFetchError) {
    return { error: candidatesFetchError.message };
  }

  const { data: voters, error: votersFetchError } = await supabase
    .from("voters")
    .select("voter_id")
    .eq("election_id", electionId);

  if (votersFetchError) {
    return { error: votersFetchError.message };
  }

  return {
    candidateIds: (candidates || []).map((row) => row.candidate_id),
    voterIds: (voters || []).map((row) => row.voter_id),
  };
}

export async function deleteVoteSelectionsForCandidates(
  candidateIds: string[],
): Promise<string | null> {
  const supabase = await createAdminClient();

  if (candidateIds.length === 0) {
    return null;
  }

  const { error } = await supabase
    .from("vote_selections")
    .delete()
    .in("candidate_id", candidateIds);

  return error ? error.message : null;
}

export async function deleteVotesAndSelectionsForVoters(
  voterIds: string[],
): Promise<string | null> {
  const supabase = await createAdminClient();

  if (voterIds.length === 0) {
    return null;
  }

  const { data: votes, error: votesFetchError } = await supabase
    .from("votes")
    .select("vote_id")
    .in("voter_id", voterIds);

  if (votesFetchError) {
    return votesFetchError.message;
  }

  const voteIds = (votes || []).map((row) => row.vote_id);
  if (voteIds.length === 0) {
    return null;
  }

  const { error: voteSelectionsDeleteError } = await supabase
    .from("vote_selections")
    .delete()
    .in("vote_id", voteIds);

  if (voteSelectionsDeleteError) {
    return voteSelectionsDeleteError.message;
  }

  const { error: votesDeleteError } = await supabase
    .from("votes")
    .delete()
    .in("vote_id", voteIds);

  return votesDeleteError ? votesDeleteError.message : null;
}

export async function deleteElectionScopedRows(
  electionId: string,
): Promise<string | null> {
  const supabase = await createAdminClient();

  const scopedTables = [
    "turnout_adjustments",
    "candidates",
    "voters",
    "positions",
    "partylists",
  ] as const;

  for (const table of scopedTables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("election_id", electionId);

    if (error) {
      return error.message;
    }
  }

  return null;
}

export async function getPositionById(positionId: string) {
  const supabase = await createAdminClient();

  const { data: position, error: positionError } = await supabase
    .from("positions")
    .select("position_id, election_id")
    .eq("position_id", positionId)
    .single();

  if (positionError || !position) {
    return { error: "Position not found" };
  }

  return position as { position_id: string; election_id: string };
}

export async function getVoterById(voterId: string) {
  const supabase = await createAdminClient();

  const { data: voter, error: voterError } = await supabase
    .from("voters")
    .select("voter_id, election_id")
    .eq("voter_id", voterId)
    .single();

  if (voterError || !voter) {
    return { error: "Voter record not found" };
  }

  return voter as { voter_id: string; election_id: string };
}

export function revalidateElectionManagementPaths(electionId: string) {
  return [`/officer/elections/${electionId}`, `/admin/elections/${electionId}`];
}
