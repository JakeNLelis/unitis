import type { AffiliationManagerProps } from "@/lib/types/public";
import { AffiliationManagerContent } from "@/app/_helpers/elections/affiliation-manager";

export function AffiliationManager({
  electionId,
  electionName,
  partylists,
}: AffiliationManagerProps) {
  return (
    <AffiliationManagerContent
      electionId={electionId}
      electionName={electionName}
      partylists={partylists}
    />
  );
}
