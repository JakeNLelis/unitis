import type { StatusLookupFormProps } from "@/lib/types/public";
import { StatusLookupForm as StatusLookupFormContent } from "@/app/_helpers/elections/status-form";

export function StatusLookupForm({
  electionId,
  electionName,
}: StatusLookupFormProps) {
  return (
    <StatusLookupFormContent
      electionId={electionId}
      electionName={electionName}
    />
  );
}
