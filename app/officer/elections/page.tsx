import { createClient } from "@/lib/supabase/server";
import { getSEBOfficer } from "@/lib/auth";
import { Election } from "@/lib/types/election";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function getElectionStatus(election: Election): {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
} {
  const now = new Date();
  const start = new Date(election.start_date);
  const end = new Date(election.end_date);
  const candidacyStart = election.candidacy_start_date
    ? new Date(election.candidacy_start_date)
    : null;
  const candidacyEnd = election.candidacy_end_date
    ? new Date(election.candidacy_end_date)
    : null;

  if (election.is_archived) return { label: "Archived", variant: "outline" };
  if (now >= start && now <= end)
    return { label: "Voting Open", variant: "default" };
  if (
    candidacyStart &&
    candidacyEnd &&
    now >= candidacyStart &&
    now <= candidacyEnd
  )
    return { label: "Filing Open", variant: "secondary" };
  if (now < start) return { label: "Upcoming", variant: "secondary" };
  return { label: "Ended", variant: "outline" };
}

async function ElectionsList() {
  const officer = await getSEBOfficer();
  if (!officer) return null;

  const supabase = await createClient();

  // Get elections created by or assigned to this officer
  const { data: elections, error } = await supabase
    .from("elections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching elections:", error);
    return <p className="text-muted-foreground">Failed to load elections.</p>;
  }

  if (!elections || elections.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No elections yet. Create your first election to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {(elections as Election[]).map((election) => {
        const status = getElectionStatus(election);
        return (
          <Link
            key={election.election_id}
            href={`/officer/elections/${election.election_id}`}
          >
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{election.name}</CardTitle>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <CardDescription>{election.election_type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Election: </span>
                    {new Date(election.start_date).toLocaleDateString()} –{" "}
                    {new Date(election.end_date).toLocaleDateString()}
                  </div>
                  {election.candidacy_end_date && (
                    <div>
                      <span className="font-medium">Filing deadline: </span>
                      {new Date(
                        election.candidacy_end_date,
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default function ElectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Elections</h1>
          <p className="text-muted-foreground">
            Manage your elections and candidacy applications
          </p>
        </div>
        <Link href="/officer/elections/new">
          <Button>Create Election</Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            Loading elections...
          </div>
        }
      >
        <ElectionsList />
      </Suspense>
    </div>
  );
}
