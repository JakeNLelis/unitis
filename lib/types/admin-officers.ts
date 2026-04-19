export interface DeleteOfficerButtonProps {
  sebOfficerId: string;
  officerName: string;
  showLabel?: boolean;
}

export interface NewOfficerFormProps {
  facultyOptionsByCampus: Record<string, FacultyOption[]>;
  campuses: string[];
}

export interface FacultyOption {
  code: string;
  label: string;
}
