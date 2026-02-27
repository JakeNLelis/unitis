export type UserRole = "system-admin" | "seb-officer" | "candidate";

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
  name: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  display_name: string;
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
