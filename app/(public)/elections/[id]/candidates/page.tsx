import { Suspense } from "react";
import { CandidatesPageContent } from "@/app/_helpers/elections/candidates-page";
import type { CandidatesPageProps } from "@/lib/types/public";

export default function CandidatesPage({
  params,
  searchParams,
}: CandidatesPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container max-w-3xl mx-auto py-10 px-4 text-center">
            <p className="text-muted-foreground">Loading candidates...</p>
          </div>
        </div>
      }
    >
      <CandidatesPageWrapper params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CandidatesPageWrapper({
  params,
  searchParams,
}: CandidatesPageProps) {
  const { id } = await params;
  const { q } = await searchParams;
  return <CandidatesPageContent electionId={id} query={q || ""} />;
}
