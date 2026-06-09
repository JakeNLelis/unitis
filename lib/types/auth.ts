export type UserRole = "system-admin" | "chairperson" | "seb-officer" | "candidate";


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
  is_chairperson: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  display_name: string;
}

export interface ActionActor {
  role: UserRole;
  userId: string;
  email: string;
  displayName: string;
  officer: {
    seb_officer_id: string;
    campus: string;
    faculty_code: string;
  } | null;
  systemAdminId: string | null;
}

export interface ElectionActor {
  role: UserRole;
  officer: {
    seb_officer_id: string;
    campus: string;
    faculty_code: string;
  } | null;
}

export interface ElectionContext {
  election_id: string;
  election_type: string;
  created_by: string | null;
  owner_campus: string | null;
  owner_faculty_code: string | null;
  access_policy_locked: boolean;
  start_date: string;
  end_date: string;
}

export interface ElectionAccessPolicyRow {
  election_type: string;
  created_by: string | null;
  owner_campus: string | null;
  owner_faculty_code: string | null;
  access_policy_locked: boolean;
}

export interface ElectionPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canManage: boolean;
}
