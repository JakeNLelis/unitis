"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isValidStudentId } from "@/lib/utils";

// @CodeScene(disable:"Complex Method")
export async function sendVoterOtp(electionId: string, studentId: string) {
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

  // Verify the election exists and voting is open
  const { data: election, error: electionError } = await adminSupabase
    .from("elections")
    .select("election_id, name, start_date, end_date, is_archived")
    .eq("election_id", electionId)
    .single();

  if (electionError || !election) {
    return { error: "Election not found." };
  }

  const now = new Date();
  const start = new Date(election.start_date);
  const end = new Date(election.end_date);
  const votingOpen = !election.is_archived && now >= start && now <= end;

  if (!votingOpen) {
    return { error: "This election is not currently open for voting." };
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

  // Send OTP via admin client (bypasses rate limits)
  const email = `${trimmedId}@vsu.edu.ph`;
  const { error: otpError } = await adminSupabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (otpError) {
    return { error: otpError.message };
  }

  return { success: true, email };
}

export async function verifyVoterOtp(email: string, token: string) {
  // Use the SSR client so the verified session is written to cookies,
  // allowing the vote page to read the authenticated voter identity.
  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
