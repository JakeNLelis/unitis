import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getDateTimeWindowStatus } from "@/lib/utils";

type CandidacyFormValues = {
  election_id: string;
  position_id: string;
  course_id: string;
  full_name: string;
  student_id: string;
  email: string;
  age: string;
  birth_date: string;
  current_address: string;
  permanent_address: string;
  cog_link: string;
  cor_link: string;
  good_moral_link: string;
  partylist_id: string;
  photo: string;
  contact_number: string;
  faculty: string;
  department: string;
  campaign_manager: string;
};

type CandidateApplication = {
  election_id: string;
  position_id: string;
  course_id: string;
  full_name: string;
  student_id: string;
  email: string;
  age: number | null;
  birth_date: string | null;
  current_address: string | null;
  permanent_address: string | null;
  cog_link: string | null;
  cor_link: string | null;
  good_moral_link: string | null;
  application_status: string;
  partylist_id: string | null;
  affiliation_status: string | null;
  user_id: string | null;
  photo: string | null;
  contact_number: string | null;
  faculty: string | null;
  department: string | null;
  campaign_manager: string | null;
};

export function readCandidacyFormValues(
  formData: FormData,
): CandidacyFormValues {
  return {
    election_id: String(formData.get("election_id") || ""),
    position_id: String(formData.get("position_id") || ""),
    course_id: String(formData.get("course_id") || ""),
    full_name: String(formData.get("full_name") || ""),
    student_id: String(formData.get("student_id") || ""),
    email: String(formData.get("email") || ""),
    age: String(formData.get("age") || ""),
    birth_date: String(formData.get("birth_date") || ""),
    current_address: String(formData.get("current_address") || ""),
    permanent_address: String(formData.get("permanent_address") || ""),
    cog_link: String(formData.get("cog_link") || ""),
    cor_link: String(formData.get("cor_link") || ""),
    good_moral_link: String(formData.get("good_moral_link") || ""),
    partylist_id: String(formData.get("partylist_id") || ""),
    photo: String(formData.get("photo") || ""),
    contact_number: String(formData.get("contact_number") || ""),
    faculty: String(formData.get("faculty") || ""),
    department: String(formData.get("department") || ""),
    campaign_manager: String(formData.get("campaign_manager") || ""),
  };
}

export function validateCandidacyFormValues(values: CandidacyFormValues) {
  if (
    !values.election_id ||
    !values.position_id ||
    !values.course_id ||
    !values.full_name ||
    !values.student_id ||
    !values.email
  ) {
    return { error: "Please fill in all required fields." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return { error: "Please enter a valid email address." };
  }

  return { values };
}

export async function getOpenCandidacyElection(electionId: string) {
  const supabase = await createClient();

  const { data: election, error } = await supabase
    .from("elections")
    .select(
      "election_id, candidacy_start_date, candidacy_end_date, is_archived",
    )
    .eq("election_id", electionId)
    .single();

  if (error || !election) {
    return { error: "Election not found." };
  }

  if (election.is_archived) {
    return { error: "This election has been archived." };
  }

  const candidacyStatus = getDateTimeWindowStatus(
    election.candidacy_start_date,
    election.candidacy_end_date,
  );

  if (candidacyStatus !== "open") {
    return { error: "The candidacy filing period is not currently open." };
  }

  return { election };
}

export async function hasExistingCandidateApplication(
  electionId: string,
  studentId: string,
  positionId: string,
) {
  const adminSupabase = await createAdminClient();

  const { data: existing } = await adminSupabase
    .from("candidates")
    .select("candidate_id")
    .eq("election_id", electionId)
    .eq("student_id", studentId)
    .eq("position_id", positionId);

  return Boolean(existing && existing.length > 0);
}

export async function insertCandidateApplication(values: CandidacyFormValues) {
  const adminSupabase = await createAdminClient();
  const hasPartylist =
    values.partylist_id && values.partylist_id !== "independent";

  const application: CandidateApplication = {
    election_id: values.election_id,
    position_id: values.position_id,
    course_id: values.course_id,
    full_name: values.full_name,
    student_id: values.student_id,
    email: values.email,
    age: values.age ? parseInt(values.age, 10) : null,
    birth_date: values.birth_date || null,
    current_address: values.current_address || null,
    permanent_address: values.permanent_address || null,
    cog_link: values.cog_link || null,
    cor_link: values.cor_link || null,
    good_moral_link: values.good_moral_link || null,
    application_status: "pending",
    partylist_id: hasPartylist ? values.partylist_id : null,
    affiliation_status: hasPartylist ? "pending" : null,
    user_id: null,
    photo: values.photo || null,
    contact_number: values.contact_number || null,
    faculty: values.faculty || null,
    department: values.department || null,
    campaign_manager: values.campaign_manager || null,
  };

  const { error } = await adminSupabase.from("candidates").insert(application);
  if (error) {
    console.error("Candidacy insert error:", error);
    return { error: "Failed to submit application. Please try again." };
  }

  return { success: true };
}
