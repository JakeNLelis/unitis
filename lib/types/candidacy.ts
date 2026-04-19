export type CouncilType = "USSC" | "FSSC";
export type CandidacyType = "Independent" | "Political Party";

export const POSITIONS = [
  "President",
  "Vice-President",
  "Secretary",
  "Treasurer",
  "Auditor",
  "Senator",
  "Board of Director",
  "Year Level Representative",
] as const;

export type Position = (typeof POSITIONS)[number];

export interface CandidacyFormData {
  councilType: CouncilType;
  photo: string;
  candidacyType: CandidacyType;
  partyName: string;
  campaignManager: string;
  position: string;
  fullName: string;
  age: string;
  birthday: string;
  studentId: string;
  currentAddress: string;
  permanentAddress: string;
  faculty: string;
  department: string;
  email: string;
  contactNumber: string;
  date: string;
}
