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
    canManage: true,
  };
}

function deniedPermissions(): ElectionPermissions {
  return {
    canView: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canManage: false,
  };
}

function creatorOnlyPermissions(isCreator: boolean, role: UserRole): ElectionPermissions {
  // Chairperson can edit details and delete; standard officer cannot change details
  const canEdit = isCreator && (role === "chairperson" || role === "system-admin");
  return {
    canView: true,
    canEdit: canEdit,
    canDelete: isCreator && (role === "chairperson" || role === "system-admin"),
    canApprove: isCreator,
    canManage: isCreator,
  };
}

export function canActorCreateElectionType(
  role: UserRole,
  electionType: string,
): boolean {
  const normalizedType = normalizeElectionType(electionType);

  if (role === "system-admin") {
    return normalizedType === "campus-wide" || normalizedType === "university-wide" || normalizedType === "faculty-wide";
  }

  if (role === "seb-officer" || role === "chairperson") {
    // SEB officers/chairpersons can only create faculty-wide elections
    return normalizedType === "faculty-wide";
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

  if (
    (actor.role !== "seb-officer" && actor.role !== "chairperson") ||
    !actor.officer
  ) {
    return deniedPermissions();
  }

  if (!election.access_policy_locked) {
    return fullPermissions();
  }

  const isCreator = election.created_by === actor.officer.seb_officer_id;
  const type = normalizeElectionType(election.election_type);

  // Check if campus and faculty code match for localized access
  const campusMatch = election.owner_campus === actor.officer.campus;
  const facultyMatch = election.owner_faculty_code === actor.officer.faculty_code;
  
  const hasLocalAccess = isCreator || (campusMatch && (type === "campus-wide" || type === "university-wide" || facultyMatch));

  if (!hasLocalAccess) {
    return deniedPermissions();
  }

  switch (type) {
    case "faculty-wide":
      return creatorOnlyPermissions(isCreator, actor.role);
    case "campus-wide":
    case "university-wide":
      // In campus-wide/university-wide elections:
      // - Standard SEB officers from that campus can view, approve candidates, and manage voters (canManage=true, canApprove=true), but cannot edit details or delete.
      // - Chairpersons from that campus CAN edit details (canEdit=true).
      return {
        canView: true,
        canEdit: actor.role === "chairperson",
        canDelete: false, // only admin can delete campus-wide
        canApprove: true,
        canManage: true,
      };
    default:
      return creatorOnlyPermissions(isCreator, actor.role);
  }
}
