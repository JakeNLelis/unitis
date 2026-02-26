import { createClient } from "@/lib/supabase/server";
import { getSEBOfficer } from "@/lib/auth";
import {
  Election,
  Position,
  CandidateWithPosition,
} from "@/lib/types/election";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { AddPositionForm } from "./add-position-form";
import { CandidateActions } from "./candidate-actions";
import { PositionList } from "./position-list";

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

  // Fetch positions
  const { data: positions } = await supabase
    .from("positions")
    .select("*")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  // Fetch candidates with position info
  const { data: candidates } = await supabase
    .from("candidates")
    .select("*, positions(title)")
    .eq("election_id", electionId)
    .order("created_at", { ascending: false });

  const electionData = election as Election;
  const positionsData = (positions || []) as Position[];
  const candidatesData = (candidates || []) as CandidateWithPosition[];

  const now = new Date();
  const candidacyOpen =
    electionData.candidacy_start_date &&
    electionData.candidacy_end_date &&
    now >= new Date(electionData.candidacy_start_date) &&
    now <= new Date(electionData.candidacy_end_date);

  const pendingCount = candidatesData.filter(
    (c) => c.application_status === "pending",
  ).length;

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
        {candidacyOpen && (
          <Badge variant="default">Candidacy Filing Open</Badge>
        )}
      </div>

      {/* Date info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Candidacy Filing Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            {electionData.candidacy_start_date &&
            electionData.candidacy_end_date ? (
              <p className="font-medium">
                {new Date(electionData.candidacy_start_date).toLocaleString()} –{" "}
                {new Date(electionData.candidacy_end_date).toLocaleString()}
              </p>
            ) : (
              <p className="text-muted-foreground">Not set</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Voting Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {new Date(electionData.start_date).toLocaleString()} –{" "}
              {new Date(electionData.end_date).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application link */}
      {candidacyOpen && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Candidacy Application Link
            </CardTitle>
            <CardDescription>
              Share this link with students who want to apply as candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="text-sm bg-muted px-3 py-2 rounded block">
              {typeof window !== "undefined" ? window.location.origin : ""}
              {applicationUrl}
            </code>
          </CardContent>
        </Card>
      )}

      {/* Positions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Positions</CardTitle>
              <CardDescription>
                {positionsData.length} position
                {positionsData.length !== 1 ? "s" : ""} defined
              </CardDescription>
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
            <div>
              <CardTitle>Candidate Applications</CardTitle>
              <CardDescription>
                {candidatesData.length} total application
                {candidatesData.length !== 1 ? "s" : ""}
                {pendingCount > 0 && ` · ${pendingCount} pending review`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {candidatesData.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              No applications yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatesData.map((candidate) => (
                  <TableRow key={candidate.candidate_id}>
                    <TableCell className="font-medium">
                      {candidate.full_name}
                    </TableCell>
                    <TableCell>{candidate.student_id}</TableCell>
                    <TableCell>{candidate.positions?.title || "–"}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>
                      {getStatusBadge(candidate.application_status)}
                    </TableCell>
                    <TableCell>
                      <CandidateActions
                        candidateId={candidate.candidate_id}
                        currentStatus={candidate.application_status}
                        electionId={electionId}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
        <div className="space-y-4">
          <p className="text-muted-foreground">Loading election...</p>
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
