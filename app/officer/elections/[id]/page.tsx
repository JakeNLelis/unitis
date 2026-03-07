import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSEBOfficer } from "@/lib/auth";
import { Election, Position, CandidateWithDetails } from "@/lib/types/election";
import { getTodayStr } from "@/lib/utils";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  ExternalLink,
  FileText,
  LinkIcon,
  Users,
  Vote,
  BarChart3,
  ListChecks,
  Trash2,
} from "lucide-react";
import { AddPositionForm } from "./add-position-form";
import { CandidateActions } from "./candidate-actions";
import { CopyableUrl } from "./copyable-url";
import { PositionList } from "./position-list";
import { EditElectionDates } from "./edit-election-dates";
import { DeleteElectionButton } from "./delete-election-button";
import { ElectionResults } from "./election-results";
import { VoterMasterlist } from "./voter-masterlist";

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-600">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

async function ElectionDetail({ electionId }: { electionId: string }) {
  const officer = await getSEBOfficer();
  if (!officer) return null;

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

  // Use admin client to bypass RLS for data fetching
  const adminSupabase = await createAdminClient();

  // Fetch positions
  const { data: positions } = await supabase
    .from("positions")
    .select("*")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  // Fetch candidates with position, course, and partylist info (admin client to bypass RLS)
  const { data: candidates } = await adminSupabase
    .from("candidates")
    .select(
      "*, positions(title), courses(name, acronym), partylists(name, acronym)",
    )
    .eq("election_id", electionId)
    .order("created_at", { ascending: false });

  // Fetch voters
  const { data: voters } = await adminSupabase
    .from("voters")
    .select("voter_id, student_id, is_voted")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  const votersData = (voters || []) as {
    voter_id: string;
    student_id: string;
    is_voted: boolean;
  }[];

  const electionData = election as Election;
  const positionsData = (positions || []) as Position[];
  const candidatesData = (candidates || []) as CandidateWithDetails[];

  const today = getTodayStr();
  const candidacyOpen =
    electionData.candidacy_start_date &&
    electionData.candidacy_end_date &&
    today >= electionData.candidacy_start_date.slice(0, 10) &&
    today <= electionData.candidacy_end_date.slice(0, 10);

  const votingStarted =
    electionData.start_date && today >= electionData.start_date.slice(0, 10);

  const pendingCount = candidatesData.filter(
    (c) => c.application_status === "pending",
  ).length;

  // Build the base URL from request headers (server component — no window)
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = `${proto}://${host}`;

  // Build the public application URL
  const applicationUrl = `/elections/${electionId}/apply`;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/officer/elections"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Elections
        </Link>
      </div>

      {/* Election header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{electionData.name}</h1>
          <p className="text-muted-foreground">{electionData.election_type}</p>
        </div>
        <div className="flex items-center gap-2">
          {candidacyOpen && (
            <Badge variant="default">Candidacy Filing Open</Badge>
          )}
          <DeleteElectionButton
            electionId={electionId}
            electionName={electionData.name}
          />
        </div>
      </div>

      {/* Date info */}
      <EditElectionDates
        electionId={electionId}
        candidacyStartDate={electionData.candidacy_start_date}
        candidacyEndDate={electionData.candidacy_end_date}
        startDate={electionData.start_date}
        endDate={electionData.end_date}
      />

      {/* Application link */}
      {candidacyOpen && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <LinkIcon className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">
                  Candidacy Application Link
                </CardTitle>
                <CardDescription>
                  Share this link with students who want to apply as candidates
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CopyableUrl url={`${baseUrl}${applicationUrl}`} />
          </CardContent>
        </Card>
      )}

      {/* Voting link */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Vote className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">Voting Link</CardTitle>
              <CardDescription>
                Share this link with students to cast their ballot
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CopyableUrl url={`${baseUrl}/elections/${electionId}/vote`} />
        </CardContent>
      </Card>

      {/* Positions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ListChecks className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle>Positions</CardTitle>
                <CardDescription>
                  {positionsData.length} position
                  {positionsData.length !== 1 ? "s" : ""} defined
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {positionsData.length > 0 && (
            <PositionList positions={positionsData} electionId={electionId} />
          )}
          <AddPositionForm electionId={electionId} />
        </CardContent>
      </Card>

      {/* Candidate applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle>Candidate Applications</CardTitle>
                <CardDescription>
                  {candidatesData.length} total application
                  {candidatesData.length !== 1 ? "s" : ""}
                  {pendingCount > 0 && ` · ${pendingCount} pending review`}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {candidatesData.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              No applications yet.
            </p>
          ) : (
            <div className="divide-y">
              {candidatesData.map((candidate) => (
                <div
                  key={candidate.candidate_id}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {candidate.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {candidate.student_id} · {candidate.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(candidate.application_status)}
                      <CandidateActions
                        candidateId={candidate.candidate_id}
                        currentStatus={candidate.application_status}
                        electionId={electionId}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Position</p>
                      <p className="font-medium">
                        {candidate.positions?.title || "–"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Course</p>
                      <p className="font-medium">
                        {candidate.courses?.acronym ||
                          candidate.courses?.name ||
                          "–"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Partylist</p>
                      <p className="font-medium">
                        {candidate.partylists
                          ? `${candidate.partylists.name} (${candidate.partylists.acronym})`
                          : "Independent"}
                      </p>
                    </div>
                  </div>

                  {/* Document links */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidate.cog_link && (
                      <a
                        href={candidate.cog_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline border rounded px-2 py-1"
                      >
                        COG <ExternalLink className="size-3" />
                      </a>
                    )}
                    {candidate.cor_link && (
                      <a
                        href={candidate.cor_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline border rounded px-2 py-1"
                      >
                        COR <ExternalLink className="size-3" />
                      </a>
                    )}
                    {candidate.good_moral_link && (
                      <a
                        href={candidate.good_moral_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline border rounded px-2 py-1"
                      >
                        Good Moral <ExternalLink className="size-3" />
                      </a>
                    )}
                    {!candidate.cog_link &&
                      !candidate.cor_link &&
                      !candidate.good_moral_link && (
                        <span className="text-xs text-muted-foreground">
                          No documents submitted
                        </span>
                      )}
                  </div>

                  {/* Rejection reason */}
                  {candidate.application_status === "rejected" &&
                    candidate.rejection_reason && (
                      <div className="mt-3 bg-destructive/10 border border-destructive/20 rounded p-3">
                        <p className="text-xs font-medium text-destructive">
                          Rejection Reason
                        </p>
                        <p className="text-sm mt-1">
                          {candidate.rejection_reason}
                        </p>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Election results — only show after voting has started */}
      {votingStarted && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle>Election Results</CardTitle>
                <CardDescription>
                  Live vote tallies per position
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ElectionResults electionId={electionId} />
          </CardContent>
        </Card>
      )}

      {/* Voter masterlist */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle>Voter Masterlist</CardTitle>
              <CardDescription>
                Manage the list of student IDs authorized to vote in this
                election
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <VoterMasterlist electionId={electionId} voters={votersData} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ElectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-48 bg-muted/50 rounded-lg animate-pulse" />
        </div>
      }
    >
      <ElectionDetailWrapper params={params} />
    </Suspense>
  );
}

async function ElectionDetailWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ElectionDetail electionId={id} />;
}
