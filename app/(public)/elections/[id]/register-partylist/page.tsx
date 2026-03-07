import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PartylistRegistrationForm } from "./partylist-form";
import Link from "next/link";

interface Election {
  election_id: string;
  name: string;
  election_type: string;
  candidacy_start_date: string | null;
  candidacy_end_date: string | null;
  is_archived: boolean;
}

async function RegisterPartylistContent({
  electionId,
}: {
  electionId: string;
}) {
  const supabase = await createClient();

  const { data: election, error } = await supabase
    .from("elections")
    .select("*")
    .eq("election_id", electionId)
    .single();

  if (error || !election) {
    notFound();
  }

  const electionData = election as Election;

  // Use date-string comparison to avoid UTC-vs-local timezone issues
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const candidacyOpen =
    electionData.candidacy_start_date &&
    electionData.candidacy_end_date &&
    today >= electionData.candidacy_start_date.slice(0, 10) &&
    today <= electionData.candidacy_end_date.slice(0, 10);

  // Fetch existing partylists
  const { data: partylists } = await supabase
    .from("partylists")
    .select("partylist_id, name, acronym")
    .eq("election_id", electionId)
    .order("name", { ascending: true });

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
