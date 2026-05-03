import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { calculateAgeFromBirthDate, isValidStudentId } from "@/lib/utils";

export type PartylistRegistrationInput = {
  election_id: string;
  name: string;
  acronym: string;
  platform: string;
  registered_by_email: string;
  registered_by_name: string;
  candidate_slate: PartylistCandidateInput[];
};

export type PartylistCandidateInput = {
  position_id: string;
  course_id: string;
  full_name: string;
  student_id: string;
  email: string;
  age: string;
  birth_date: string;
  current_address: string;
  permanent_address: string;
  contact_number: string;
  photo: string;
  cog_link: string;
  cor_link: string;
  good_moral_link: string;
  faculty: string;
  department: string;
};

export function getPartylistRegistrationInput(
  formData: FormData,
): PartylistRegistrationInput | { error: string } {
  const election_id = formData.get("election_id") as string;
  const name = formData.get("name") as string;
  const acronym = formData.get("acronym") as string;
  const platform = formData.get("platform") as string;
  const registered_by_email = formData.get("registered_by_email") as string;
  const registered_by_name = formData.get("registered_by_name") as string;
  const candidateSlateRaw = String(formData.get("candidate_slate") || "[]");

  const requiredValues = [
    election_id,
    name,
    acronym,
    registered_by_email,
    registered_by_name,
  ];

  if (requiredValues.some((value) => !value)) {
    return { error: "Please fill in all required fields." };
  }

  let candidate_slate: PartylistCandidateInput[] = [];
  try {
    const parsed = JSON.parse(candidateSlateRaw) as unknown;
    if (!Array.isArray(parsed)) {
      return { error: "Invalid candidate slate payload." };
    }

    candidate_slate = parsed.map((row) => {
      const candidate = row as Partial<PartylistCandidateInput>;
      return {
        position_id: String(candidate.position_id || "").trim(),
        course_id: String(candidate.course_id || "").trim(),
        full_name: String(candidate.full_name || "").trim(),
        student_id: String(candidate.student_id || "").trim(),
        email: String(candidate.email || "").trim(),
        age: String(
          candidate.age ||
            calculateAgeFromBirthDate(
              String(candidate.birth_date || "").trim(),
            ),
        ).trim(),
        birth_date: String(candidate.birth_date || "").trim(),
        current_address: String(candidate.current_address || "").trim(),
        permanent_address: String(candidate.permanent_address || "").trim(),
        contact_number: String(candidate.contact_number || "").trim(),
        photo: String(candidate.photo || "").trim(),
        cog_link: String(candidate.cog_link || "").trim(),
        cor_link: String(candidate.cor_link || "").trim(),
        good_moral_link: String(candidate.good_moral_link || "").trim(),
        faculty: String(candidate.faculty || "").trim(),
        department: String(candidate.department || "").trim(),
      };
    });
  } catch {
    return { error: "Invalid candidate slate payload." };
  }

  if (candidate_slate.length === 0) {
    return {
      error:
        "At least one partylist candidate is required before registration.",
    };
  }

  for (const candidate of candidate_slate) {
    if (
      !candidate.position_id ||
      !candidate.course_id ||
      !candidate.full_name ||
      !candidate.student_id ||
      !candidate.email
    ) {
      return {
        error:
          "Every encoded candidate must have position, course, full name, student ID, and email.",
      };
    }

    if (!isValidStudentId(candidate.student_id)) {
      return {
        error: "Student ID must match the format xx-x-xxxxx (e.g. 23-1-01457).",
      };
    }

    if (!candidate.birth_date) {
      return {
        error: "Each candidate must include a valid birth date.",
      };
    }
  }

  return {
    election_id,
    name,
    acronym,
    platform,
    registered_by_email,
    registered_by_name,
    candidate_slate,
  };
}

export async function getOpenElectionForPartylistRegistration(
  electionId: string,
) {
  const supabase = await createClient();

  return supabase
    .from("elections")
    .select(
      "election_id, candidacy_start_date, candidacy_end_date, is_archived",
    )
    .eq("election_id", electionId)
    .single();
}

export async function hasExistingPartylist(
  electionId: string,
  column: "acronym" | "name" | "representative_email",
  value: string,
) {
  const adminSupabase = await createAdminClient();

  const { data } = await adminSupabase
    .from("partylists")
    .select("partylist_id")
    .eq("election_id", electionId)
    .eq(column, value);

  return !!data?.length;
}

export async function getRequiredPartylistPositionIds(electionId: string) {
  const adminSupabase = await createAdminClient();

  const { data, error } = await adminSupabase
    .from("positions")
    .select("position_id")
    .eq("election_id", electionId)
    .eq("required_for_partylist", true);

  if (error) {
    return { error: "Failed to fetch partylist position requirements." };
  }

  return { positionIds: (data || []).map((item) => item.position_id) };
}
