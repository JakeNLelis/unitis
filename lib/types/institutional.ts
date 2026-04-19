import type { HTMLAttributes, ReactNode, TableHTMLAttributes } from "react";

export interface InstitutionalDataTableProps extends TableHTMLAttributes<HTMLTableElement> {
  headers: string[];
  data: Array<Record<string, ReactNode>>;
}

export interface InstitutionalCountdownProps {
  targetDate: string | Date;
  label?: string;
  expiredLabel?: string;
  className?: string;
}

export interface InstitutionalCandidate {
  candidate_id: string;
  full_name: string;
  photo: string | null;
  position_title: string;
  partylist_name: string | null;
  partylist_acronym: string | null;
}

export interface CandidateRegistryProps {
  candidates: InstitutionalCandidate[];
}

export interface InstitutionalListItemProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  value?: string | number;
  status?: string;
  timestamp?: string;
  action?: ReactNode;
  href?: string;
  trend?: {
    label: string;
    isPositive: boolean;
  };
}

export interface InstitutionalPieChartProps {
  percentage: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export interface OfficerMobileNavProps {
  displayName?: string | null;
  logoutButton: ReactNode;
}
