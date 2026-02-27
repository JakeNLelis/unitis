"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateAffiliationStatus } from "../actions";
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

interface Candidate {
  candidate_id: string;
  full_name: string;
  student_id: string;
  email: string;
  affiliation_status: string;
  positions: { title: string } | null;
  courses: { name: string; acronym: string | null } | null;
}

interface Partylist {
  partylist_id: string;
  name: string;
  acronym: string;
  registered_by_email: string;
  registered_by_name: string;
}

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

export function AffiliationManager({
  electionId,
  electionName,
  partylists,
}: {
  electionId: string;
  electionName: string;
  partylists: Partylist[];
}) {
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [myPartylist, setMyPartylist] = useState<Partylist | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const found = partylists.find(
      (p) => p.registered_by_email.toLowerCase() === email.toLowerCase(),
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
      fetchCandidates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified, myPartylist]);

  async function fetchCandidates() {
    if (!myPartylist) return;
    setLoadingCandidates(true);

    const res = await fetch(
      `/elections/${electionId}/manage-partylist/api?partylist_id=${myPartylist.partylist_id}`,
    );
    if (res.ok) {
      const data = await res.json();
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
      // Update local state
      setCandidates((prev) =>
        prev.map((c) =>
          c.candidate_id === candidateId
            ? { ...c, affiliation_status: action }
            : c,
        ),
      );
      router.refresh();
    }
    setActionLoading(null);
  }

  if (!verified) {
    return (
      <form
        onSubmit={handleVerifyEmail}
        className="space-y-4 max-w-2xl mx-auto"
      >
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

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Partylist info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {myPartylist?.acronym} — {myPartylist?.name}
          </CardTitle>
          <CardDescription>
            Representative: {myPartylist?.registered_by_name} (
            {myPartylist?.registered_by_email})
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {/* Candidates */}
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
          {candidates.map((c) => (
            <Card key={c.candidate_id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold">{c.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.student_id} &middot; {c.email}
                    </p>
                  </div>
                  {affiliationBadge(c.affiliation_status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Position:</span>{" "}
                    {c.positions?.title || "N/A"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Course:</span>{" "}
                    {c.courses
                      ? c.courses.acronym
                        ? `${c.courses.acronym}`
                        : c.courses.name
                      : "N/A"}
                  </div>
                </div>

                {c.affiliation_status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleAction(c.candidate_id, "verified")}
                      disabled={actionLoading === c.candidate_id}
                    >
                      {actionLoading === c.candidate_id
                        ? "..."
                        : "Confirm Affiliation"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(c.candidate_id, "rejected")}
                      disabled={actionLoading === c.candidate_id}
                    >
                      {actionLoading === c.candidate_id
                        ? "..."
                        : "Deny Affiliation"}
                    </Button>
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
