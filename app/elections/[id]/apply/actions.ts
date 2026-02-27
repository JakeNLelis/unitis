"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTodayStr } from "@/lib/utils";
import crypto from "crypto";

function generatePassword(): string {
  // Generate a readable 12-char password: 8 random chars + 4 digits
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars[crypto.randomInt(chars.length)];
  }
  for (let i = 0; i < 4; i++) {
    password += digits[crypto.randomInt(digits.length)];
  }
  return password;
}

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
  const partylist_id = formData.get("partylist_id") as string;
  const photo = formData.get("photo") as string;
  const contact_number = formData.get("contact_number") as string;
  const faculty = formData.get("faculty") as string;
  const department = formData.get("department") as string;
  const campaign_manager = formData.get("campaign_manager") as string;

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
  const adminSupabase = await createAdminClient();

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

  // Use string-based date comparison to avoid UTC timezone mismatch
  const today = getTodayStr();
  const candStart = election.candidacy_start_date?.slice(0, 10) ?? null;
  const candEnd = election.candidacy_end_date?.slice(0, 10) ?? null;
  if (!candStart || !candEnd || today < candStart || today > candEnd) {
    return { error: "The candidacy filing period is not currently open." };
  }

  // Check if this student already applied for the same position
  const { data: existing } = await adminSupabase
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

  // Generate a password for the candidate's account
  const tempPassword = generatePassword();

  // Check if an auth account already exists for this email
  let userId: string | null = null;
  let isExistingAccount = false;

  // Look up existing user by email directly (avoid loading all users)
  const { data: existingUserLookup } = await adminSupabase
    .from("candidates")
    .select("user_id")
    .eq("email", email.toLowerCase())
    .limit(1)
    .maybeSingle();

  let existingUser: { id: string } | null = null;
  if (existingUserLookup?.user_id) {
    const { data: userById } = await adminSupabase.auth.admin.getUserById(
      existingUserLookup.user_id,
    );
    existingUser = userById?.user ?? null;
  }

  if (existingUser) {
    // Reuse existing auth account (candidate applying to another position/election)
    userId = existingUser.id;
    isExistingAccount = true;
  } else {
    // Create a new Supabase auth account for the candidate
    const { data: newUser, error: createUserError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Skip email verification
        user_metadata: {
          full_name,
          student_id,
          role: "candidate",
        },
      });

    if (createUserError) {
      console.error("Create user error:", createUserError);
      return {
        error:
          "Failed to create your account. Please try again or contact support.",
      };
    }

    userId = newUser.user.id;
  }

  // Submit the application
  const hasPartylist = partylist_id && partylist_id !== "independent";
  const { error: insertError } = await adminSupabase.from("candidates").insert({
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
    partylist_id: hasPartylist ? partylist_id : null,
    affiliation_status: hasPartylist ? "pending" : null,
    user_id: userId,
    photo: photo || null,
    contact_number: contact_number || null,
    faculty: faculty || null,
    department: department || null,
    campaign_manager: campaign_manager || null,
  });

  if (insertError) {
    console.error("Candidacy insert error:", insertError);
    return {
      error: "Failed to submit application. Please try again.",
    };
  }

  return {
    success: true,
    credentials: isExistingAccount ? null : { email, password: tempPassword },
  };
}
