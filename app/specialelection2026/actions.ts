"use server";

import { createClient } from "@/lib/supabase/server";
import { isValidStudentId, normalizeStudentId } from "@/lib/utils";

type SpecialElectionLookupResult =
  | { error: string }
  | {
      notFound: true;
      message: string;
      facultyEmails: string;
      facultyCode: string;
    }
  | {
      success: true;
      studentName: string;
      email: string;
      googleFormUrl: string;
      facultyAssigned: string;
    };

function getRosterField(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "";
}

export async function lookupSpecialElectionVoter(
  facultyCode: string,
  studentId: string,
): Promise<SpecialElectionLookupResult> {
  const normalizedFaculty = facultyCode?.trim();
  const normalizedStudentId = normalizeStudentId(studentId ?? "");

  if (!normalizedFaculty) {
    return { error: "Please select your faculty." };
  }

  if (!normalizedStudentId) {
    return { error: "Please enter your student ID number." };
  }

  if (!isValidStudentId(normalizedStudentId)) {
    return {
      error: "Student ID must match the format XX-X-XXXXX (e.g. 23-1-01457).",
    };
  }

  const supabase = await createClient();

  const { data: rosterMatches, error: rosterError } = await supabase
    .from("specialelection2026")
    .select("*")
    .eq("student_id", normalizedStudentId.toUpperCase());

  if (rosterError) {
    return {
      error:
        "The special-election roster is unavailable right now. Please try again later.",
    };
  }

  const matchingRecord = (rosterMatches ?? []).find((row) => {
    const assignedFaculty = getRosterField(row as Record<string, unknown>, "faculty", "faculty_assigned")
      .toUpperCase();
    return assignedFaculty === normalizedFaculty.toUpperCase();
  });

  if (!rosterMatches || rosterMatches.length === 0) {
    const facultyCodeUpper = normalizedFaculty.toUpperCase();
    const { data: facultyOfficers, error: officersError } = await supabase
      .from("seb_officers")
      .select("email, faculty_code, campus")
      .eq("faculty_code", facultyCodeUpper);

    if (officersError) {
      return {
        notFound: true,
        message:
          "Your student ID was not found in the faculty roster of eligible voters.",
        facultyEmails: "",
        facultyCode: facultyCodeUpper,
      };
    }

    const facultyEmails = (facultyOfficers ?? [])
      .map((officer) => officer.email)
      .filter(Boolean)
      .join(", ");

    return {
      notFound: true,
      message:
        "Your student ID was not found in the faculty roster of eligible voters.",
      facultyEmails,
      facultyCode: facultyCodeUpper,
    };
  }

  if (!matchingRecord) {
    const facultyCodeUpper = normalizedFaculty.toUpperCase();
    const { data: facultyOfficers, error: officersError } = await supabase
      .from("seb_officers")
      .select("email, faculty_code, campus")
      .eq("faculty_code", facultyCodeUpper);

    if (officersError) {
      return {
        notFound: true,
        message:
          "Your student ID was not found in the faculty roster of eligible voters.",
        facultyEmails: "",
        facultyCode: facultyCodeUpper,
      };
    }

    const facultyEmails = (facultyOfficers ?? [])
      .map((officer) => officer.email)
      .filter(Boolean)
      .join(", ");

    return {
      notFound: true,
      message:
        "Your student ID was not found in the faculty roster of eligible voters.",
      facultyEmails,
      facultyCode: facultyCodeUpper,
    };
  }

  const facultyAssigned = getRosterField(
    matchingRecord as Record<string, unknown>,
    "faculty",
    "faculty_assigned",
  );
  const googleFormUrl = getRosterField(
    matchingRecord as Record<string, unknown>,
    "ballotlink",
    "google_form_url",
    "ballot_link",
  );

  return {
    success: true,
    studentName: "Eligible voter",
    email: "No email stored for this roster entry.",
    googleFormUrl,
    facultyAssigned,
  };
}
