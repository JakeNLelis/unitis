import type {
  UserRole,
  ElectionAccessPolicyRow,
  ElectionPermissions,
  ElectionActor,
} from "@/lib/types/auth";

function normalizeElectionType(type: string): string {
  return (type || "").trim().toLowerCase();
}

export function canActorCreateElectionType(
  role: UserRole,
  electionType: string,
): boolean {
  const normalizedType = normalizeElectionType(electionType);

  if (role === "system-admin") {
    return normalizedType === "university-wide";
  }

  if (role === "seb-officer") {
    return (
      normalizedType === "campus-wide" || normalizedType === "faculty-wide"
    );
  }

  return false;
}

export function getElectionPermissionsForActor(
  election: ElectionAccessPolicyRow,
  actor: ElectionActor,
): ElectionPermissions {
  const isAdmin = actor.role === "system-admin";

  if (isAdmin) {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canApprove: true,
    };
  }

  if (actor.role !== "seb-officer" || !actor.officer) {
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
    };
  }

  const isLegacyUnlocked = !election.access_policy_locked;
  if (isLegacyUnlocked) {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canApprove: true,
    };
  }

  const isCreator = election.created_by === actor.officer.seb_officer_id;
  const sameCampus =
    !!election.owner_campus && election.owner_campus === actor.officer.campus;

  const type = normalizeElectionType(election.election_type);

  if (type === "campus-wide") {
    return {
      canView: isCreator || sameCampus,
      canEdit: isCreator,
      canDelete: isCreator,
      canApprove: isCreator || sameCampus,
    };
  }

  if (type === "faculty-wide") {
    return {
      canView: true,
      canEdit: isCreator,
      canDelete: isCreator,
      canApprove: isCreator,
    };
  }

  if (type === "university-wide") {
    return {
      canView: true,
      canEdit: false,
      canDelete: false,
      canApprove: true,
    };
  }

  return {
    canView: true,
    canEdit: isCreator,
    canDelete: isCreator,
    canApprove: isCreator,
  };
}
