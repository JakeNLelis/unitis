"use server";

import {
  getOpenCandidacyElection,
  hasExistingCandidateApplication,
  insertCandidateApplication,
  readCandidacyFormValues,
  validateCandidacyFormValues,
} from "@/app/_helpers/elections/apply-actions";

export async function submitCandidacyApplication(formData: FormData) {
  const values = readCandidacyFormValues(formData);
  const validation = validateCandidacyFormValues(values);
  if ("error" in validation) {
    return validation;
  }

  const electionResult = await getOpenCandidacyElection(values.election_id);
  if ("error" in electionResult) {
    return electionResult;
  }

  const alreadyApplied = await hasExistingCandidateApplication(
    values.election_id,
    values.student_id,
    values.position_id,
  );

  if (alreadyApplied) {
    return {
      error: "You have already submitted an application for this position.",
    };
  }

  return insertCandidateApplication(values);
}
