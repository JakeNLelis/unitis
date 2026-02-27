import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ElectionRow {
  election_id: string;
  name: string;
  election_type: string;
  start_date: string;
  end_date: string;
  candidacy_start_date: string | null;
  candidacy_end_date: string | null;
  is_archived: boolean;
}

/** Extract YYYY-MM-DD from any date/timestamp string or Date object */
function toDateStr(value: string | Date): string {
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  // DB may return "2026-02-27" or "2026-02-27T00:00:00+00:00" — take first 10 chars
  return value.slice(0, 10);
}

function getElectionStatus(election: ElectionRow) {
  const today = toDateStr(new Date());
  const start = toDateStr(election.start_date);
  const end = toDateStr(election.end_date);

  if (today >= start && today <= end) {
    return { label: "Voting Open", color: "bg-green-600" };
  }
  if (election.candidacy_start_date && election.candidacy_end_date) {
    const candStart = toDateStr(election.candidacy_start_date);
    const candEnd = toDateStr(election.candidacy_end_date);
    if (today >= candStart && today <= candEnd) {
      return { label: "Filing Open", color: "bg-blue-600" };
    }
  }
  if (today < start) {
    return { label: "Upcoming", color: "bg-yellow-600" };
  }
  return { label: "Ended", color: "bg-gray-500" };
}

async function ElectionsList() {
  const supabase = await createClient();

  const { data: elections } = await supabase
    .from("elections")
    .select("*")
    .eq("is_archived", false)
    .order("start_date", { ascending: true });

  const activeElections = (elections as ElectionRow[] | null)?.filter((e) => {
    const status = getElectionStatus(e);
    return status.label !== "Ended";
  });

  if (!activeElections || activeElections.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            No upcoming or active elections at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {activeElections.map((election) => {
        const status = getElectionStatus(election);
        const today = toDateStr(new Date());
        const candidacyOpen =
          election.candidacy_start_date &&
          election.candidacy_end_date &&
          today >= toDateStr(election.candidacy_start_date) &&
          today <= toDateStr(election.candidacy_end_date);

        return (
          <Card key={election.election_id}>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-xl">{election.name}</CardTitle>
                  <CardDescription>{election.election_type}</CardDescription>
                </div>
                <Badge className={status.color}>{status.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Voting Period:</span>{" "}
                  {new Date(election.start_date).toLocaleDateString()} –{" "}
                  {new Date(election.end_date).toLocaleDateString()}
                </div>
                {election.candidacy_start_date &&
                  election.candidacy_end_date && (
                    <div>
                      <span className="text-muted-foreground">
                        Filing Period:
                      </span>{" "}
                      {new Date(
                        election.candidacy_start_date,
                      ).toLocaleDateString()}{" "}
                      –{" "}
                      {new Date(
                        election.candidacy_end_date,
                      ).toLocaleDateString()}
                    </div>
                  )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Link href={`/elections/${election.election_id}/apply`}>
                  <Button size="sm">
                    {candidacyOpen
                      ? "Apply as Candidate"
                      : "View Candidacy Info"}
                  </Button>
                </Link>
                <Link href={`/elections/${election.election_id}/status`}>
                  <Button size="sm" variant="outline">
                    Check Application Status
                  </Button>
                </Link>
                {candidacyOpen && (
                  <Link
                    href={`/elections/${election.election_id}/register-partylist`}
                  >
                    <Button size="sm" variant="outline">
                      Register Partylist
                    </Button>
                  </Link>
                )}
                <Link
                  href={`/elections/${election.election_id}/manage-partylist`}
                >
                  <Button size="sm" variant="ghost">
                    Manage Partylist
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Plenum</h1>
            <p className="text-muted-foreground mt-1">
              University Election System
            </p>
          </div>
          <Link href="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>

        {/* Elections */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Active Elections</h2>
          <Suspense
            fallback={
              <p className="text-muted-foreground">Loading elections...</p>
            }
          >
            <ElectionsList />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
