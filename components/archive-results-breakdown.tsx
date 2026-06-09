"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import ElectionResultPDF from "@/app/(protected)/officer/elections/[id]/results-pdf";
import type { ArchiveResultsBreakdownProps } from "@/lib/types/components";

export type { ArchiveCandidateResult } from "@/lib/types/components";

export function ArchiveResultsBreakdown(props: ArchiveResultsBreakdownProps) {
  const {
    electionName,
    totalVotes,
    expectedVoters,
    turnoutPercentage,
    quorumTarget,
    quorumMet,
    candidateResults,
  } = props;

  // Sort candidate results by vote total descending
  const sortedCandidateResults = [...candidateResults].sort(
    (a, b) => b.vote_total - a.vote_total
  );

  const chartConfig = {
    votes: {
      label: "Votes",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const handleDownloadPDF = async () => {
    try {
      const blob = await pdf(
        <ElectionResultPDF
          electionName={electionName}
          totalVotes={totalVotes}
          expectedVoters={expectedVoters}
          turnoutPercentage={turnoutPercentage}
          quorumTarget={quorumTarget}
          quorumMet={quorumMet}
          candidateResults={candidateResults}
        />
      ).toBlob();

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `election-results-${electionName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>{electionName} Results</CardTitle>
            <CardDescription>
              Summary turnout metrics for the ended election
            </CardDescription>
          </div>
          {props.canDownloadPdf && (
            <Button onClick={handleDownloadPDF} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          )}
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
            <div className="space-y-6">
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart
                  data={sortedCandidateResults}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="full_name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={150}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="vote_total"
                    fill="var(--color-votes)"
                    radius={4}
                    name="votes"
                  />
                </BarChart>
              </ChartContainer>

              <div className="space-y-3">
                {sortedCandidateResults.map((candidate) => (
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
