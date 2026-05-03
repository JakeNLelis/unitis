import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDateTimeWindowStatus } from "@/lib/utils";
import type {
  ApplyPageContentProps,
  ApplyPageElection,
  ApplyPageProps,
  CourseOption,
} from "@/lib/types/public";
import {
  ApplyFormCard,
  ApplyPageHeader,
  ApplyStatusCard,
  FilingWindowCard,
  NoPositionsCard,
} from "@/app/_helpers/elections/apply-page";

async function ApplyPageContent({ electionId }: ApplyPageContentProps) {
  const { createClient } = await import("@/lib/supabase/server");
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select("*")
    .eq("election_id", electionId)
    .single();

  if (electionError || !election) {
    notFound();
  }

  const electionData = election as ApplyPageElection;
  const candidacyStatus = getDateTimeWindowStatus(
    electionData.candidacy_start_date,
    electionData.candidacy_end_date,
  );
  const candidacyOpen = candidacyStatus === "open";

  const { data: positions } = await supabase
    .from("positions")
    .select("position_id, title")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  const { data: courses } = await adminSupabase
    .from("courses")
    .select("course_id, name, acronym, departments(name, faculties(name))")
    .order("name", { ascending: true });

  const courseOptions: CourseOption[] = (courses || []).map((course) => {
    const departmentObj = Array.isArray(course.departments)
      ? course.departments[0]
      : course.departments;
    const facultyObj = Array.isArray(departmentObj?.faculties)
      ? departmentObj?.faculties[0]
      : departmentObj?.faculties;

    return {
      course_id: course.course_id,
      name: course.name,
      acronym: course.acronym,
      department_name: departmentObj?.name || "",
      faculty_name: facultyObj?.name || "",
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-10 px-4 space-y-6">
        <ApplyPageHeader
          electionName={electionData.name}
          electionType={electionData.election_type}
        />

        {electionData.candidacy_start_date &&
          electionData.candidacy_end_date && (
            <FilingWindowCard
              startDate={electionData.candidacy_start_date}
              endDate={electionData.candidacy_end_date}
              open={candidacyOpen}
            />
          )}

        {candidacyOpen ? (
          positions && positions.length > 0 ? (
            <ApplyFormCard
              electionId={electionId}
              electionName={electionData.name}
              electionType={electionData.election_type}
              positions={positions}
              courses={courseOptions}
              partylists={[]}
            />
          ) : (
            <NoPositionsCard />
          )
        ) : (
          <ApplyStatusCard
            status={candidacyStatus}
            startDate={electionData.candidacy_start_date}
            endDate={electionData.candidacy_end_date}
          />
        )}
      </div>
    </div>
  );
}

export default function ApplyPage({ params }: ApplyPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container max-w-3xl mx-auto py-10 px-4 text-center">
            <p className="text-muted-foreground">Loading application form...</p>
          </div>
        </div>
      }
    >
      <ApplyPageWrapper params={params} />
    </Suspense>
  );
}

async function ApplyPageWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApplyPageContent electionId={id} />;
}
