"use server";

import { createClient } from "@/lib/supabase/server";
import { isValidStudentId, maskEmail, normalizeStudentId } from "@/lib/utils";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { applyTarpitDelay } from "@/lib/tarpit";

export type UsscPlebisciteLookupResult =
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
      maskedEmail: string;
      hasEmail: boolean;
      googleFormUrl: string;
      altEmailGoogleFormUrl: string;
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

export async function lookupUsscPlebisciteVoter(
  facultyCode: string,
  studentId: string,
  turnstileToken?: string,
): Promise<UsscPlebisciteLookupResult> {
  // A.3 Progressive Tarpitting: Add intentional asynchronous delay to thwart automated scrapers
  await applyTarpitDelay(1000, 400);

  // A.1 Cloudflare Turnstile: Verify bot challenge token
  const turnstileCheck = await verifyTurnstileToken(turnstileToken);
  if (!turnstileCheck.success) {
    return {
      error:
        turnstileCheck.error ||
        "Security verification failed. Please complete the security check.",
    };
  }

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
    .from("usscplebiscite2026")
    .select("*")
    .eq("student_id", normalizedStudentId.toUpperCase());

  if (rosterError) {
    return {
      error:
        "The USSC plebiscite roster is unavailable right now. Please try again later.",
    };
  }

  const matchingRecord = (rosterMatches ?? []).find((row) => {
    const assignedFaculty = getRosterField(
      row as Record<string, unknown>,
      "faculty",
      "faculty_assigned",
    ).toUpperCase();
    return assignedFaculty === normalizedFaculty.toUpperCase();
  });

  if (!rosterMatches || rosterMatches.length === 0 || !matchingRecord) {
    const facultyCodeUpper = normalizedFaculty.toUpperCase();
    const { data: facultyOfficers, error: officersError } = await supabase
      .from("seb_officers")
      .select("email, faculty_code, campus")
      .eq("faculty_code", facultyCodeUpper);

    const facultyEmails = officersError
      ? ""
      : (facultyOfficers ?? [])
          .map((officer) => officer.email)
          .filter(Boolean)
          .join(", ");

    return {
      notFound: true,
      message:
        "Your student ID was not found in the roster of eligible voters for this faculty.",
      facultyEmails,
      facultyCode: facultyCodeUpper,
    };
  }

  const facultyAssigned = getRosterField(
    matchingRecord as Record<string, unknown>,
    "faculty_assigned",
    "faculty",
  );

  const googleFormUrl = getRosterField(
    matchingRecord as Record<string, unknown>,
    "google_form_url",
    "ballotlink",
    "ballot_link",
  );

  const rawEmail = getRosterField(
    matchingRecord as Record<string, unknown>,
    "email_address",
    "email",
    "student_email",
  );

  const altEmailGoogleFormUrl = getRosterField(
    matchingRecord as Record<string, unknown>,
    "alt_email_google_form_url",
    "alternative_email_google_form_url",
    "alt_email_form_url",
    "alt_email_google_form_link",
    "change_email_form_url",
  );

  const maskedEmail = rawEmail ? maskEmail(rawEmail) : "";

  return {
    success: true,
    studentName: "Eligible voter",
    maskedEmail,
    hasEmail: Boolean(rawEmail),
    googleFormUrl,
    altEmailGoogleFormUrl,
    facultyAssigned,
  };
}
