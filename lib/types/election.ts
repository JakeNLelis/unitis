export interface Election {
  election_id: string;
  name: string;
  created_by: string | null;
  created_by_admin_id: string | null;
  owner_campus: string | null;
  owner_faculty_code: string | null;
  access_policy_locked: boolean;
  start_date: string;
  end_date: string;
  candidacy_start_date: string | null;
  candidacy_end_date: string | null;
  is_archived: boolean;
  election_type: string;
  created_at: string;
  updated_at: string;
}

export interface Position {
  position_id: string;
  election_id: string;
  title: string;
  max_votes: number;
  required_for_partylist: boolean;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";
export type AffiliationStatus = "pending" | "verified" | "rejected";

export interface Partylist {
  partylist_id: string;
  election_id: string;
  name: string;
  acronym: string;
  platform: string | null;
  logo_url: string | null;
  registered_by_email: string;
  registered_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  candidate_id: string;
  election_id: string;
  position_id: string;
  course_id: string;
  full_name: string;
  age: number | null;
  birth_date: string | null;
  student_id: string;
  current_address: string | null;
  permanent_address: string | null;
  email: string;
  cog_link: string | null;
  cor_link: string | null;
  good_moral_link: string | null;
  application_status: ApplicationStatus;
  partylist_id: string | null;
  affiliation_status: AffiliationStatus | null;
  rejection_reason: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  approved_by_user_id: string | null;
  approved_by_role: "seb-officer" | "system-admin" | null;
  approved_by_display: string | null;
  approved_at: string | null;
}

export interface CandidateWithPosition extends Candidate {
  positions: {
    title: string;
  };
}

export interface CandidateWithDetails extends Candidate {
  positions: { title: string };
  courses: { name: string; acronym: string | null };
  partylists: { name: string; acronym: string } | null;
}

export interface PositionWithCandidates extends Position {
  candidates: Candidate[];
}

export const ELECTION_TYPES = ["University-Wide", "Faculty-Wide"] as const;

export type ElectionType = (typeof ELECTION_TYPES)[number];

// Turnout-related types

export type ElectionState = "upcoming" | "active" | "ended";

export interface TurnoutSnapshot {
  election_id: string;
  casted_votes: number;
  expected_voters: number;
  turnout_percentage: number;
  last_updated_at: string;
}

export interface TurnoutAdjustment {
  adjustment_id: string;
  election_id: string;
  seb_officer_id: string | null;
  casted_votes_delta: number | null;
  expected_voters_value: number | null;
  reason: string | null;
  created_at: string;
}

export interface TurnoutAdjustmentInput {
  election_id?: string;
  casted_votes_delta?: number;
  expected_voters_value?: number;
  reason?: string;
}
