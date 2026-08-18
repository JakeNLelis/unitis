import type { PartylistRegistrationCandidateDraft } from "@/lib/types/public";

export default function createEmptyCandidate(): PartylistRegistrationCandidateDraft {
  return {
    position_id: "",
    course_id: "",
    full_name: "",
    student_id: "",
    email: "",
    age: "",
    birth_date: "",
    current_address: "",
    permanent_address: "",
    contact_number: "",
    photo: "",
    cog_link: "",
    cor_link: "",
    good_moral_link: "",
    faculty: "",
    department: "",
    has_two_failing_grades: false,
  };
}
