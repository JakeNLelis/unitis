import type {
  PartylistRegistrationCandidateDraft,
  CourseOption,
} from "@/lib/types/public";

export default function validateCandidate(
  positionTitle: string,
  candidate: PartylistRegistrationCandidateDraft,
  electionType: string,
  ownerFacultyCode: string | null | undefined,
  courses: CourseOption[],
): string | null {
  if (
    !candidate.full_name ||
    !candidate.student_id ||
    !candidate.email ||
    !candidate.position_id ||
    !candidate.course_id ||
    !candidate.birth_date ||
    !candidate.current_address ||
    !candidate.permanent_address ||
    !candidate.contact_number ||
    !candidate.photo ||
    !candidate.cog_link ||
    !candidate.cor_link ||
    !candidate.good_moral_link
  ) {
    return `Candidate details are incomplete for ${positionTitle}.`;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) {
    return `Candidate email is invalid for ${positionTitle}.`;
  }

  if (electionType === "Faculty-Wide" && ownerFacultyCode) {
    const course = courses.find((c) => c.course_id === candidate.course_id);
    if (course && course.faculty_acronym !== ownerFacultyCode) {
      const ownerCourse = courses.find(
        (c) => c.faculty_acronym === ownerFacultyCode,
      );
      const ownerFacultyName = ownerCourse
        ? ownerCourse.faculty_name
        : ownerFacultyCode;
      return `Candidate ${candidate.full_name} for ${positionTitle} belongs to ${course.faculty_name}, which is not eligible for this ${ownerFacultyName} faculty-wide election.`;
    }
  }

  return null;
}
