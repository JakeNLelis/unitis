import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface CandidateApplication {
  candidate_id: string;
  full_name: string;
  student_id: string;
  email: string;
  application_status: string;
  rejection_reason: string | null;
  affiliation_status: string | null;
  cog_link: string | null;
  cor_link: string | null;
  good_moral_link: string | null;
  created_at: string;
  elections: {
    name: string;
    election_type: string;
    start_date: string;
    end_date: string;
  };
  positions: { title: string };
  courses: { name: string; acronym: string | null };
  partylists: { name: string; acronym: string } | null;
}

function statusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-600">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "pending":
    default:
      return <Badge variant="secondary">Pending Review</Badge>;
  }
}

function affiliationBadge(status: string | null) {
  if (!status) return null;
  switch (status) {
    case "verified":
      return (
        <Badge className="bg-green-600" variant="outline">
          Affiliation Verified
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Affiliation Rejected</Badge>;
    case "pending":
      return <Badge variant="secondary">Affiliation Pending</Badge>;
    default:
      return null;
  }
}

async function CandidateDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  // Fetch all applications for this user
  const { data: applications, error } = await supabase
    .from("candidates")
    .select(
      `
      candidate_id,
      full_name,
      student_id,
      email,
      application_status,
      rejection_reason,
      affiliation_status,
      cog_link,
      cor_link,
      good_moral_link,
      created_at,
      elections(name, election_type, start_date, end_date),
      positions(title),
      courses(name, acronym),
      partylists(name, acronym)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
  }

  const apps = (applications as unknown as CandidateApplication[]) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your candidacy applications
        </p>
      </div>

      {apps.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              You haven&apos;t submitted any candidacy applications yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {apps.map((app) => (
            <Card key={app.candidate_id}>
              <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {app.elections?.name || "Election"}
                    </CardTitle>
                    <CardDescription>
                      {app.elections?.election_type} &middot; Filed on{" "}
                      {new Date(app.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {statusBadge(app.application_status)}
                    {affiliationBadge(app.affiliation_status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Position</p>
                    <p className="font-medium">
                      {app.positions?.title || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Course</p>
                    <p className="font-medium">
                      {app.courses
                        ? app.courses.acronym
                          ? `${app.courses.acronym} — ${app.courses.name}`
                          : app.courses.name
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Partylist</p>
                    <p className="font-medium">
                      {app.partylists
                        ? `${app.partylists.acronym} — ${app.partylists.name}`
                        : "Independent"}
                    </p>
                  </div>
                </div>

                {/* Voting period */}
                {app.elections && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      Voting Period:{" "}
                    </span>
                    {new Date(app.elections.start_date).toLocaleDateString()} –{" "}
                    {new Date(app.elections.end_date).toLocaleDateString()}
                  </div>
                )}

                {/* Documents */}
                <div className="flex flex-wrap gap-2">
                  {app.cog_link && (
                    <a
                      href={app.cog_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline border rounded px-2 py-1"
                    >
                      COG <ExternalLink className="size-3" />
                    </a>
                  )}
                  {app.cor_link && (
                    <a
                      href={app.cor_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline border rounded px-2 py-1"
                    >
                      COR <ExternalLink className="size-3" />
                    </a>
                  )}
                  {app.good_moral_link && (
                    <a
                      href={app.good_moral_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline border rounded px-2 py-1"
                    >
                      Good Moral <ExternalLink className="size-3" />
                    </a>
                  )}
                  {!app.cog_link && !app.cor_link && !app.good_moral_link && (
                    <span className="text-xs text-muted-foreground">
                      No documents submitted
                    </span>
                  )}
                </div>

                {/* Rejection reason */}
                {app.application_status === "rejected" &&
                  app.rejection_reason && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                      <p className="text-xs font-medium text-destructive">
                        Reason for Rejection
                      </p>
                      <p className="text-sm mt-1">{app.rejection_reason}</p>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CandidatePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-72 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-40 bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-40 bg-muted/50 rounded-lg animate-pulse" />
        </div>
      }
    >
      <CandidateDashboard />
    </Suspense>
  );
}
