"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitCandidacyApplication(formData: FormData) {
  const election_id = formData.get("election_id") as string;
  const position_id = formData.get("position_id") as string;
  const course_id = formData.get("course_id") as string;
  const full_name = formData.get("full_name") as string;
  const student_id = formData.get("student_id") as string;
  const email = formData.get("email") as string;
  const age = formData.get("age") as string;
  const birth_date = formData.get("birth_date") as string;
  const current_address = formData.get("current_address") as string;
  const permanent_address = formData.get("permanent_address") as string;
  const cog_link = formData.get("cog_link") as string;
  const cor_link = formData.get("cor_link") as string;
  const good_moral_link = formData.get("good_moral_link") as string;

  // Validate required fields
  if (
    !election_id ||
    !position_id ||
    !course_id ||
    !full_name ||
    !student_id ||
    !email
  ) {
    return { error: "Please fill in all required fields." };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createClient();

  // Verify the election exists and candidacy period is open
  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select(
      "election_id, candidacy_start_date, candidacy_end_date, is_archived",
    )
    .eq("election_id", election_id)
    .single();

  if (electionError || !election) {
    return { error: "Election not found." };
  }

  if (election.is_archived) {
    return { error: "This election has been archived." };
  }

  const now = new Date();
  if (
    !election.candidacy_start_date ||
    !election.candidacy_end_date ||
    now < new Date(election.candidacy_start_date) ||
    now > new Date(election.candidacy_end_date)
  ) {
    return { error: "The candidacy filing period is not currently open." };
  }

  // Check if this student already applied for the same position
  const { data: existing } = await supabase
    .from("candidates")
    .select("candidate_id")
    .eq("election_id", election_id)
    .eq("student_id", student_id)
    .eq("position_id", position_id);

  if (existing && existing.length > 0) {
    return {
      error: "You have already submitted an application for this position.",
    };
  }

  // Submit the application
  const { error: insertError } = await supabase.from("candidates").insert({
    election_id,
    position_id,
    course_id,
    full_name,
    student_id,
    email,
    age: age ? parseInt(age) : null,
    birth_date: birth_date || null,
    current_address: current_address || null,
    permanent_address: permanent_address || null,
    cog_link: cog_link || null,
    cor_link: cor_link || null,
    good_moral_link: good_moral_link || null,
    application_status: "pending",
  });

  if (insertError) {
    console.error("Candidacy insert error:", insertError);
    return {
      error: "Failed to submit application. Please try again.",
    };
  }

  return { success: true };
}
