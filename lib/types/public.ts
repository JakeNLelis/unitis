import type { CandidacyFormData } from "@/lib/types/candidacy";
import type { TurnoutSnapshot } from "@/lib/types/election";

export interface ArchiveDetailPageProps {
  params: Promise<{ id: string }>;
}

export interface ConcludedElection {
  election_id: string;
  name: string;
  election_type: string;
  start_date: string;
  end_date: string;
  is_archived: boolean;
}

export interface VoterValidationPageProps {
  params: Promise<{ id: string }>;
}

export interface VoterValidationFormProps {
  electionId: string;
  electionName: string;
}

export interface CheckEligibilityPageProps {
  params: Promise<{ id: string }>;
}

export interface PDFPreviewProps {
  data: CandidacyFormData;
}

export interface CandidacyPDFProps {
  data: CandidacyFormData;
}

export interface RegisterPartylistElection {
  election_id: string;
  name: string;
  election_type: string;
  candidacy_start_date: string | null;
  candidacy_end_date: string | null;
  is_archived: boolean;
}

export interface RegisterPartylistContentProps {
  electionId: string;
}

export interface ApplyPageElection {
  election_id: string;
  name: string;
  election_type: string;
  start_date: string;
  end_date: string;
  candidacy_start_date: string | null;
  candidacy_end_date: string | null;
  is_archived: boolean;
}

export interface CourseOption {
  course_id: string;
  name: string;
  acronym: string | null;
  department_name: string;
  faculty_name: string;
}

export interface ApplyPageContentProps {
  electionId: string;
}

export interface ApplyPageProps {
  params: Promise<{ id: string }>;
}

export interface ApplicationFormPosition {
  position_id: string;
  title: string;
}

export interface ApplicationFormCourse {
  course_id: string;
  name: string;
  acronym: string | null;
  department_name: string;
  faculty_name: string;
}

export interface ApplicationFormPartylist {
  partylist_id: string;
  name: string;
  acronym: string;
}

export interface ApplicationFormProps {
  electionId: string;
  electionName: string;
  electionType: string;
  positions: ApplicationFormPosition[];
  courses: ApplicationFormCourse[];
  partylists: ApplicationFormPartylist[];
}

export interface ElectionPageProps {
  params: Promise<{ id: string }>;
}

export type NormalizedCandidate = {
  candidate_id: string;
  full_name: string;
  photo: string | null;
  position_title: string;
  partylist_name: string | null;
  partylist_acronym: string | null;
};

export interface CandidatesElectionMeta {
  election_id: string;
  name: string;
  election_type: string;
  start_date: string;
  end_date: string;
}

export interface CandidatesPositionRow {
  position_id: string;
  title: string;
}

export interface CandidatePartylistInfo {
  name: string;
  acronym: string;
  platform: string | null;
}

export interface CandidatesRow {
  candidate_id: string;
  position_id: string;
  full_name: string;
  photo: string | null;
  partylists: CandidatePartylistInfo | null;
}

export interface CandidatesRaw {
  candidate_id: string;
  position_id: string;
  full_name: string;
  photo: string | null;
  partylists: CandidatePartylistInfo | CandidatePartylistInfo[] | null;
}

export interface CandidatesContentProps {
  electionId: string;
  query: string;
}

export interface CandidatesPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}

export interface CandidateOption {
  candidate_id: string;
  full_name: string;
  position_id: string;
  partylist: { name: string; acronym: string } | null;
}

export interface BallotPositionWithCandidates {
  position_id: string;
  title: string;
  max_votes: number;
  candidates: CandidateOption[];
}

export interface BallotFormProps {
  electionId: string;
  electionName: string;
  studentId: string;
  positions: BallotPositionWithCandidates[];
}

export interface BallotSubmission {
  electionId: string;
  studentId: string;
  selections: Record<string, string[]>;
}

export interface AffiliationCandidate {
  candidate_id: string;
  full_name: string;
  student_id: string;
  email: string;
  affiliation_status: string;
  positions: { title: string } | null;
  courses: { name: string; acronym: string | null } | null;
}

export interface AffiliationPartylist {
  partylist_id: string;
  name: string;
  acronym: string;
  registered_by_email: string;
  registered_by_name: string;
}

export interface AffiliationManagerProps {
  electionId: string;
  electionName: string;
  partylists: AffiliationPartylist[];
}

export interface TurnoutPageProps {
  params: Promise<{ id: string }>;
}

export interface TurnoutLiveClientProps {
  electionId: string;
  initialSnapshot: TurnoutSnapshot | null;
}

export interface StatusCandidateResult {
  candidate_id: string;
  full_name: string;
  student_id: string;
  email: string;
  application_status: string;
  rejection_reason: string | null;
  affiliation_status: string | null;
  cog_link: string | null;
  cor_link: string | null;
  good_moral_link: string | null;
  created_at: string;
  positions: { title: string }[] | { title: string } | null;
  courses:
    | { name: string; acronym: string | null }[]
    | { name: string; acronym: string | null }
    | null;
  partylists:
    | { name: string; acronym: string }[]
    | { name: string; acronym: string }
    | null;
}

export interface StatusLookupFormProps {
  electionId: string;
  electionName: string;
}
