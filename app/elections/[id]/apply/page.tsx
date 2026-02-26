import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplicationForm } from "./application-form";

interface Election {
  election_id: string;
  name: string;
  election_type: string;
  start_date: string;
  end_date: string;
  candidacy_start_date: string | null;
  candidacy_end_date: string | null;
  is_archived: boolean;
}

async function ApplyPageContent({ electionId }: { electionId: string }) {
  const supabase = await createClient();

  // Fetch election
  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select("*")
    .eq("election_id", electionId)
    .single();

  if (electionError || !election) {
    notFound();
  }

  const electionData = election as Election;

  // Check if candidacy period is open
  const now = new Date();
  const candidacyOpen =
    electionData.candidacy_start_date &&
    electionData.candidacy_end_date &&
    now >= new Date(electionData.candidacy_start_date) &&
    now <= new Date(electionData.candidacy_end_date);

  const candidacyNotStarted =
    electionData.candidacy_start_date &&
    now < new Date(electionData.candidacy_start_date);

  const candidacyEnded =
    electionData.candidacy_end_date &&
    now > new Date(electionData.candidacy_end_date);

  // Fetch positions for this election
  const { data: positions } = await supabase
    .from("positions")
    .select("position_id, title")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  // Fetch all courses for the dropdown
  const { data: courses } = await supabase
    .from("courses")
    .select("course_id, name, acronym")
    .order("name", { ascending: true });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-10 px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Candidacy Application</h1>
          <p className="text-lg text-muted-foreground">{electionData.name}</p>
          <Badge variant="outline">{electionData.election_type}</Badge>
        </div>

        {/* Candidacy period info */}
        {electionData.candidacy_start_date &&
          electionData.candidacy_end_date && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Filing Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {new Date(electionData.candidacy_start_date).toLocaleString()}{" "}
                  – {new Date(electionData.candidacy_end_date).toLocaleString()}
                </p>
                {candidacyOpen && (
                  <Badge className="mt-2 bg-green-600">
                    Filing is currently open
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}

        {/* Show form or status message */}
        {candidacyOpen ? (
          positions && positions.length > 0 ? (
            <ApplicationForm
              electionId={electionId}
              electionName={electionData.name}
              positions={positions}
              courses={courses || []}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  No positions have been defined for this election yet. Please
                  check back later.
                </p>
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              {candidacyNotStarted && (
                <>
                  <p className="text-lg font-medium">
                    Candidacy filing has not started yet
                  </p>
                  <p className="text-muted-foreground">
                    Filing opens on{" "}
                    {new Date(
                      electionData.candidacy_start_date!,
                    ).toLocaleString()}
                  </p>
                </>
              )}
              {candidacyEnded && (
                <>
                  <p className="text-lg font-medium">
                    Candidacy filing period has ended
                  </p>
                  <p className="text-muted-foreground">
                    The deadline was{" "}
                    {new Date(
                      electionData.candidacy_end_date!,
                    ).toLocaleString()}
                  </p>
                </>
              )}
              {!electionData.candidacy_start_date && (
                <p className="text-muted-foreground">
                  Candidacy filing is not available for this election.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
