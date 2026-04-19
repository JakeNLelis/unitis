import type { ElectionState, TurnoutSnapshot } from "@/lib/types/election";

export interface ProtectedNavLink {
  href: string;
  label: string;
  exact?: boolean;
}

export interface ProtectedTopNavProps {
  homeHref: string;
  links: ProtectedNavLink[];
  identityText: string;
}

export interface ArchiveCandidateResult {
  candidate_id: string;
  full_name: string;
  position_title: string;
  vote_total: number;
}

export interface ArchiveResultsBreakdownProps {
  electionName: string;
  totalVotes: number;
  expectedVoters: number;
  turnoutPercentage: number;
  candidateResults: ArchiveCandidateResult[];
}

export interface EligibilityCheckProps {
  electionId: string;
  electionName: string;
}

export interface EventActionPanelProps {
  electionId: string;
  electionName: string;
  state: ElectionState;
  variant?: "default" | "compact";
}

export interface ElectionListItem {
  election_id: string;
  name: string;
  election_type: string;
  start_date: string;
  end_date: string;
}

export interface HappeningNowElectionCardProps {
  election: ElectionListItem;
}

export interface HappeningNowSectionProps {
  elections: ElectionListItem[];
}

export interface UpcomingElectionCardProps {
  election: ElectionListItem;
}

export interface UpcomingElectionSectionProps {
  elections: ElectionListItem[];
}

export interface HeaderSectionProps {
  color?: "blue" | "white";
}

export interface LogoProps {
  size?: "sm" | "lg";
  color?: "blue" | "white";
  className?: string;
}

export interface SharedTurnoutLiveClientProps {
  electionId: string;
  initialSnapshot: TurnoutSnapshot | null;
}

export interface TurnoutData {
  casted_votes: number;
  expected_voters: number;
  turnout_percentage: number;
}

export interface TurnoutSummaryCardProps {
  data: TurnoutData | null;
  isLoading?: boolean;
}
