import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { toDateStr } from "@/lib/utils";
import { Election } from "@/lib/types/election";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Vote,
  FileText,
  Search,
  Users,
  Settings,
  Calendar,
  //ArrowRight,
  ChevronRight,
} from "lucide-react";

function getElectionStatus(election: Election) {
  const today = toDateStr(new Date());
  const start = toDateStr(election.start_date);
  const end = toDateStr(election.end_date);

  if (today >= start && today <= end) {
    return { label: "Voting Open", variant: "default" as const, icon: Vote };
  }
  if (election.candidacy_start_date && election.candidacy_end_date) {
    const candStart = toDateStr(election.candidacy_start_date);
    const candEnd = toDateStr(election.candidacy_end_date);
    if (today >= candStart && today <= candEnd) {
      return {
        label: "Filing Open",
        variant: "secondary" as const,
        icon: FileText,
      };
    }
  }
  if (today < start) {
    return {
      label: "Upcoming",
      variant: "secondary" as const,
      icon: Calendar,
    };
  }
  return { label: "Ended", variant: "outline" as const, icon: Calendar };
}

async function ElectionsList() {
  const supabase = await createClient();

  const { data: elections } = await supabase
    .from("elections")
    .select("*")
    .eq("is_archived", false)
    .order("start_date", { ascending: true });

  const activeElections = (elections as Election[] | null)?.filter((e) => {
    const status = getElectionStatus(e);
    return status.label !== "Ended";
  });

  if (!activeElections || activeElections.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-3 size-10 rounded-full bg-muted flex items-center justify-center">
            <Vote className="size-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">
            No active elections at this time
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later for upcoming elections.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {activeElections.map((election) => {
        const status = getElectionStatus(election);
        const StatusIcon = status.icon;
        const today = toDateStr(new Date());
        const candidacyOpen =
          election.candidacy_start_date &&
          election.candidacy_end_date &&
          today >= toDateStr(election.candidacy_start_date) &&
          today <= toDateStr(election.candidacy_end_date);

        return (
          <Card
            key={election.election_id}
            className="overflow-hidden transition-all hover:shadow-md hover:border-primary/30"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <StatusIcon className="size-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{election.name}</CardTitle>
                    <CardDescription className="mt-0.5">
                      {election.election_type}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Voting:</span>{" "}
                  <span className="font-medium">
                    {new Date(election.start_date).toLocaleDateString()} –{" "}
                    {new Date(election.end_date).toLocaleDateString()}
                  </span>
                </div>
                {election.candidacy_start_date &&
                  election.candidacy_end_date && (
                    <div className="flex items-center gap-2">
                      <FileText className="size-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Filing:
                      </span>{" "}
                      <span className="font-medium">
                        {new Date(
                          election.candidacy_start_date,
                        ).toLocaleDateString()}{" "}
                        –{" "}
                        {new Date(
                          election.candidacy_end_date,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1 border-t">
                {status.label === "Voting Open" && (
                  <Button asChild size="sm">
                    <Link href={`/elections/${election.election_id}/vote`}>
                      <Vote className="size-4" />
                      Vote Now
                    </Link>
                  </Button>
                )}
                <Button
                  asChild
                  size="sm"
                  variant={
                    status.label === "Voting Open" ? "outline" : "default"
                  }
                >
                  <Link href={`/elections/${election.election_id}/apply`}>
                    <FileText className="size-4" />
                    {candidacyOpen
                      ? "Apply as Candidate"
                      : "View Candidacy Info"}
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/elections/${election.election_id}/status`}>
                    <Search className="size-4" />
                    Check Status
                  </Link>
                </Button>
                {candidacyOpen && (
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/elections/${election.election_id}/register-partylist`}
                    >
                      <Users className="size-4" />
                      Register Partylist
                    </Link>
                  </Button>
                )}
                <Button asChild size="sm" variant="ghost">
                  <Link
                    href={`/elections/${election.election_id}/manage-partylist`}
                  >
                    <Settings className="size-4" />
                    Manage Partylist
                  </Link>
                </Button>
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
      {/* Hero */}
      <div className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-16 sm:py-20">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="size-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="size-7 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Plenum
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto text-balance">
                Secure, transparent election management for university student
                bodies
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/auth/login">
                Sign in
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Elections */}
      <div className="container max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Active elections</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Participate in ongoing or upcoming elections
            </p>
          </div>
        </div>
        <Suspense
          fallback={
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading elections...</p>
              </CardContent>
            </Card>
          }
        >
          <ElectionsList />
        </Suspense>
      </div>
    </main>
  );
}
