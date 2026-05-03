import type { ElectionPageProps } from "@/lib/types/public";
import { ElectionPageContent } from "@/app/_helpers/elections/election-page-content";

export default async function ElectionPage({ params }: ElectionPageProps) {
  const { id } = await params;
  return <ElectionPageContent id={id} />;
}
