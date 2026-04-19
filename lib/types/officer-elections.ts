export interface DateTimeRangePickerProps {
  title: string;
  description?: string;
  startLabel: string;
  endLabel: string;
  startName: string;
  endName: string;
  required?: boolean;
}

export interface DeleteElectionButtonProps {
  electionId: string;
  electionName: string;
  canDelete: boolean;
}

export interface VoterMasterlistVoter {
  voter_id: string;
  student_id: string;
  is_voted: boolean;
}

export interface VoterMasterlistProps {
  electionId: string;
  voters: VoterMasterlistVoter[];
  canEdit: boolean;
}

export interface TurnoutAdjustmentFormProps {
  electionId: string;
  canEdit: boolean;
}

export interface OfficerPositionSummary {
  position_id: string;
  title: string;
  max_votes: number;
}

export interface PositionItemProps {
  position: OfficerPositionSummary;
  electionId: string;
  canEdit: boolean;
}

export interface PositionListProps {
  positions: OfficerPositionSummary[];
  electionId: string;
  canEdit: boolean;
}

export interface OfficerCandidateResult {
  candidate_id: string;
  full_name: string;
  partylist: { name: string; acronym: string } | null;
  vote_count: number;
}

export interface OfficerPositionResult {
  position_id: string;
  title: string;
  max_votes: number;
  candidates: OfficerCandidateResult[];
}

export interface ElectionResultsProps {
  electionId: string;
}

export interface EditElectionDatesProps {
  electionId: string;
  candidacyStartDate: string | null;
  candidacyEndDate: string | null;
  startDate: string;
  endDate: string;
  canEdit: boolean;
}
