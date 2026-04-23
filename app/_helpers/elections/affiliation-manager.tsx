"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateAffiliationStatus } from "@/app/(public)/elections/[id]/manage-partylist/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  AffiliationCandidate,
  AffiliationManagerProps,
  AffiliationPartylist,
} from "@/lib/types/public";

function affiliationBadge(status: string) {
  switch (status) {
    case "verified":
      return <Badge className="bg-green-600">Verified</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "pending":
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

function VerificationForm({
  electionName,
  email,
  setEmail,
  error,
  onSubmit,
}: {
  electionName: string;
  email: string;
  setEmail: (value: string) => void;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Partylist Representative Verification
          </CardTitle>
          <CardDescription>
            Enter the email you used when registering your partylist for{" "}
            <strong>{electionName}</strong> to manage candidate affiliations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="rep_email">Representative Email</Label>
            <Input
              id="rep_email"
              type="email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Verify & Continue
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

function PartylistInfoCard({
  partylist,
}: {
  partylist: AffiliationPartylist | null;
}) {
  if (!partylist) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {partylist.acronym} — {partylist.name}
        </CardTitle>
        <CardDescription>
          Representative: {partylist.registered_by_name} (
          {partylist.registered_by_email})
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function CandidateAffiliationCard({
  candidate,
  onAction,
  loading,
}: {
  candidate: AffiliationCandidate;
  onAction: (candidateId: string, action: "verified" | "rejected") => void;
  loading: string | null;
}) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="font-semibold">{candidate.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {candidate.student_id} &middot; {candidate.email}
            </p>
          </div>
          {affiliationBadge(candidate.affiliation_status)}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Position:</span>{" "}
            {candidate.positions?.title || "N/A"}
          </div>
          <div>
            <span className="text-muted-foreground">Course:</span>{" "}
            {candidate.courses
              ? candidate.courses.acronym
                ? `${candidate.courses.acronym}`
                : candidate.courses.name
              : "N/A"}
          </div>
        </div>

        {candidate.affiliation_status === "pending" && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={() => onAction(candidate.candidate_id, "verified")}
              disabled={loading === candidate.candidate_id}
            >
              {loading === candidate.candidate_id
                ? "..."
                : "Confirm Affiliation"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onAction(candidate.candidate_id, "rejected")}
              disabled={loading === candidate.candidate_id}
            >
              {loading === candidate.candidate_id ? "..." : "Deny Affiliation"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AffiliationManagerContent({
  electionId,
  electionName,
  partylists,
}: AffiliationManagerProps) {
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [myPartylist, setMyPartylist] = useState<AffiliationPartylist | null>(
    null,
  );
  const [candidates, setCandidates] = useState<AffiliationCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const found = partylists.find(
      (partylist) =>
        partylist.registered_by_email.toLowerCase() === email.toLowerCase(),
    );
    if (!found) {
      setError(
        "No partylist found registered with this email for this election.",
      );
      return;
    }

    setMyPartylist(found);
    setVerified(true);
  }

  useEffect(() => {
    if (verified && myPartylist) {
      void fetchCandidates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified, myPartylist]);

  async function fetchCandidates() {
    if (!myPartylist) return;
    setLoadingCandidates(true);

    const response = await fetch(
      `/elections/${electionId}/manage-partylist/api?partylist_id=${myPartylist.partylist_id}`,
    );
    if (response.ok) {
      const data = await response.json();
      setCandidates(data.candidates || []);
    } else {
      setError("Failed to load candidates.");
    }
    setLoadingCandidates(false);
  }

  async function handleAction(
    candidateId: string,
    action: "verified" | "rejected",
  ) {
    setActionLoading(candidateId);
    const result = await updateAffiliationStatus(candidateId, action);
    if (result.error) {
      setError(result.error);
    } else {
      setCandidates((previous) =>
        previous.map((candidate) =>
          candidate.candidate_id === candidateId
            ? { ...candidate, affiliation_status: action }
            : candidate,
        ),
      );
      router.refresh();
    }
    setActionLoading(null);
  }

  if (!verified) {
    return (
      <VerificationForm
        electionName={electionName}
        email={email}
        setEmail={setEmail}
        error={error}
        onSubmit={handleVerifyEmail}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PartylistInfoCard partylist={myPartylist} />

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {loadingCandidates ? (
        <p className="text-center text-muted-foreground">
          Loading candidates...
        </p>
      ) : candidates.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No candidates have claimed affiliation with your partylist yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            Candidates Claiming Affiliation ({candidates.length})
          </h3>
          {candidates.map((candidate) => (
            <CandidateAffiliationCard
              key={candidate.candidate_id}
              candidate={candidate}
              onAction={handleAction}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
