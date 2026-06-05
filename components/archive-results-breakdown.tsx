import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ArchiveResultsBreakdownProps } from "@/lib/types/components";

export type { ArchiveCandidateResult } from "@/lib/types/components";

export function ArchiveResultsBreakdown({
  electionName,
  totalVotes,
  expectedVoters,
  turnoutPercentage,
  quorumTarget,
  quorumMet,
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
          <div className={`mt-4 p-3 rounded-lg border ${quorumMet ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'}`}>
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${quorumMet ? 'bg-green-500' : 'bg-amber-500'}`} />
              <p className="text-sm font-medium">
                {quorumMet ? 'Quorum Established' : 'Quorum Not Met'}
              </p>
              <p className="text-xs text-muted-foreground ml-auto">
                {totalVotes} of {quorumTarget} required
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
