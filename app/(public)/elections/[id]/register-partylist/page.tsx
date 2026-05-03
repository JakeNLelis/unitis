import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PartylistRegistrationForm } from "./partylist-form";
import Link from "next/link";
import { isDateTimeWindowOpen } from "@/lib/utils";
import type {
  CourseOption,
  RegisterPartylistContentProps,
  RegisterPartylistElection,
} from "@/lib/types/public";
import { createAdminClient } from "@/lib/supabase/admin";

async function RegisterPartylistContent({
  electionId,
}: RegisterPartylistContentProps) {
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  const { data: election, error } = await supabase
    .from("elections")
    .select("*")
    .eq("election_id", electionId)
    .single();

  if (error || !election) {
    notFound();
  }

  const electionData = election as RegisterPartylistElection;

  const candidacyOpen = isDateTimeWindowOpen(
    electionData.candidacy_start_date,
    electionData.candidacy_end_date,
  );

  // Fetch existing partylists
  const { data: partylists } = await supabase
    .from("partylists")
    .select("partylist_id, name, acronym")
    .eq("election_id", electionId)
    .order("name", { ascending: true });

  const { data: positions } = await supabase
    .from("positions")
    .select("position_id, title, required_for_partylist")
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
      <div className="container max-w-3xl mx-auto py-10 px-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Register Partylist</h1>
          <p className="text-lg text-muted-foreground">{electionData.name}</p>
          <Badge variant="outline">{electionData.election_type}</Badge>
        </div>

        {/* Existing partylists */}
        {partylists && partylists.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Registered Partylists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {partylists.map((p) => (
                  <Badge key={p.partylist_id} variant="secondary">
                    {p.name} ({p.acronym})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {candidacyOpen ? (
          <PartylistRegistrationForm
            electionId={electionId}
            electionName={electionData.name}
            electionType={electionData.election_type}
            positions={positions || []}
            courses={courseOptions}
          />
        ) : (
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-lg font-medium">
                Partylist registration is not available
              </p>
              <p className="text-muted-foreground">
                Registration is only open during the candidacy filing period.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Link
            href={`/elections/${electionId}/apply`}
            className="text-sm text-primary hover:underline"
          >
            ← Back to Candidacy Application
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPartylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container max-w-3xl mx-auto py-10 px-4 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <RegisterPartylistWrapper params={params} />
    </Suspense>
  );
}

async function RegisterPartylistWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RegisterPartylistContent electionId={id} />;
}
