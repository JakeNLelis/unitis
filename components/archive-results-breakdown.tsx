import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface ArchiveCandidateResult {
  candidate_id: string;
  full_name: string;
  position_title: string;
  vote_total: number;
}

interface ArchiveResultsBreakdownProps {
  electionName: string;
  totalVotes: number;
  expectedVoters: number;
  turnoutPercentage: number;
  candidateResults: ArchiveCandidateResult[];
}

export function ArchiveResultsBreakdown({
  electionName,
  totalVotes,
  expectedVoters,
  turnoutPercentage,
  candidateResults,
}: ArchiveResultsBreakdownProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{electionName} Results</CardTitle>
          <CardDescription>
            Summary turnout metrics for the ended election
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total votes cast</p>
              <p className="text-2xl font-semibold">{totalVotes}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected voters</p>
              <p className="text-2xl font-semibold">{expectedVoters}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Turnout</p>
              <p className="text-2xl font-semibold">
                {expectedVoters === 0
                  ? "—"
                  : `${turnoutPercentage.toFixed(1)}%`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-candidate totals</CardTitle>
          <CardDescription>
            Vote totals grouped by candidate and position
          </CardDescription>
        </CardHeader>
        <CardContent>
          {candidateResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No candidate results available.
            </p>
          ) : (
            <div className="space-y-3">
              {candidateResults.map((candidate) => (
                <div
                  key={candidate.candidate_id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{candidate.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {candidate.position_title}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">
                    {candidate.vote_total}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
