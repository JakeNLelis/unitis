import type {
  UserRole,
  ElectionAccessPolicyRow,
  ElectionPermissions,
  ElectionActor,
} from "@/lib/types/auth";

function normalizeElectionType(type: string): string {
  return (type || "").trim().toLowerCase();
}

function fullPermissions(): ElectionPermissions {
  return {
    canView: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
  };
}

function deniedPermissions(): ElectionPermissions {
  return {
    canView: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
  };
}

function creatorOnlyPermissions(isCreator: boolean): ElectionPermissions {
  return {
    canView: true,
    canEdit: isCreator,
    canDelete: isCreator,
    canApprove: isCreator,
  };
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
  if (actor.role === "system-admin") {
    return fullPermissions();
  }

  if (actor.role !== "seb-officer" || !actor.officer) {
    return deniedPermissions();
  }

  if (!election.access_policy_locked) {
    return fullPermissions();
  }

  const isCreator = election.created_by === actor.officer.seb_officer_id;
  const sameCampus =
    !!election.owner_campus && election.owner_campus === actor.officer.campus;

  const type = normalizeElectionType(election.election_type);

  switch (type) {
    case "campus-wide":
      return {
        canView: isCreator || sameCampus,
        canEdit: isCreator,
        canDelete: isCreator,
        canApprove: isCreator || sameCampus,
      };
    case "faculty-wide":
      return creatorOnlyPermissions(isCreator);
    case "university-wide":
      return {
        canView: true,
        canEdit: false,
        canDelete: false,
        canApprove: true,
      };
    default:
      return creatorOnlyPermissions(isCreator);
  }
}
