export type UserRole = "system-admin" | "seb-officer" | "candidate";
type ElectionManagerRole = Extract<UserRole, "seb-officer" | "system-admin">;

export interface SystemAdministrator {
  system_admin_id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface SEBOfficer {
  seb_officer_id: string;
  system_admin_id: string;
  election_id: string | null;
  faculty_code: string;
  campus: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  display_name: string;
}

export interface ActionActor {
  role: ElectionManagerRole;
  userId: string;
  displayName: string;
  officer: {
    seb_officer_id: string;
    campus: string;
    faculty_code: string;
  } | null;
  systemAdminId: string | null;
}

export interface ElectionContext {
  election_id: string;
  election_type: string;
  created_by: string | null;
  owner_campus: string | null;
  owner_faculty_code: string | null;
  access_policy_locked: boolean | null;
  start_date: string;
  end_date: string;
}

export interface ElectionAccessPolicyRow {
  election_type: string;
  created_by: string | null;
  owner_campus: string | null;
  owner_faculty_code: string | null;
  access_policy_locked: boolean | null;
}

export interface ElectionPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

export interface ElectionActor {
  role: UserRole;
  officer: Pick<
    SEBOfficer,
    "seb_officer_id" | "campus" | "faculty_code"
  > | null;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  "system-admin": 2,
  "seb-officer": 1,
  candidate: 0,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  "system-admin": "System Administrator",
  "seb-officer": "SEB Officer",
  candidate: "Candidate",
};

export function canManageRole(
  currentUserRole: UserRole,
  targetRole: UserRole,
): boolean {
  // Only system-admin can create/manage SEB officers
  return (
    currentUserRole === "system-admin" &&
    ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetRole]
  );
}

export function isHigherOrEqualRole(role1: UserRole, role2: UserRole): boolean {
  return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2];
}
