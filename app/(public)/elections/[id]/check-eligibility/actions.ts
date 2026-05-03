"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isValidStudentId } from "@/lib/utils";

// @CodeScene(disable:"Complex Method")
export async function checkEligibilityAndSendOtp(
  electionId: string,
  studentId: string,
) {
  const trimmedId = studentId.trim();

  if (!trimmedId) {
    return { error: "Please enter your student ID number." };
  }

  if (!isValidStudentId(trimmedId)) {
    return {
      error: "Student ID must match the format xx-x-xxxxx (e.g. 23-1-01457).",
    };
  }

  const adminSupabase = await createAdminClient();

  // Verify the election exists
  const { data: election, error: electionError } = await adminSupabase
    .from("elections")
    .select("election_id, name")
    .eq("election_id", electionId)
    .single();

  if (electionError || !election) {
    return { error: "Election not found." };
  }

  // Check if the election has a voter masterlist
  const { count: masterlistCount } = await adminSupabase
    .from("voters")
    .select("*", { count: "exact", head: true })
    .eq("election_id", electionId);

  if (!masterlistCount || masterlistCount === 0) {
    return { error: "No voter masterlist has been set up for this election." };
  }

  // Check if the student ID is in the masterlist
  const { data: voter } = await adminSupabase
    .from("voters")
    .select("voter_id, is_voted")
    .eq("election_id", electionId)
    .eq("student_id", trimmedId)
    .single();

  if (!voter) {
    return {
      error:
        "Your student ID was not found in the voter masterlist for this election.",
    };
  }

  if (voter.is_voted) {
    return { error: "This student ID has already voted in this election." };
  }

  // Construct the VSU school email and send OTP via admin client
  const email = `${trimmedId}@vsu.edu.ph`;

  const { error: otpError } = await adminSupabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (otpError) {
    return { error: otpError.message };
  }

  return { success: true, email };
}

export async function verifyEligibilityOtp(email: string, token: string) {
  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
