export interface Election {
  election_id: string;
  name: string;
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
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

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
  created_at: string;
  updated_at: string;
}

export interface CandidateWithPosition extends Candidate {
  positions: {
    title: string;
  };
}

export interface PositionWithCandidates extends Position {
  candidates: Candidate[];
}

export const ELECTION_TYPES = [
  "University-Wide",
  "College-Based",
  "Department-Based",
] as const;

export type ElectionType = (typeof ELECTION_TYPES)[number];
