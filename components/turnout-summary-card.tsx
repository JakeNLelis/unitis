"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TurnoutSummaryCardProps } from "@/lib/types/components";

export type { TurnoutData } from "@/lib/types/components";

export function TurnoutSummaryCard({
  data,
  isLoading,
}: TurnoutSummaryCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Turnout</CardTitle>
          <CardDescription>Loading turnout data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Turnout</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No turnout data available</p>
        </CardContent>
      </Card>
    );
  }

  const turnoutDisplay =
    data.expected_voters === 0 ? "—" : `${data.turnout_percentage.toFixed(1)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Turnout</CardTitle>
        <CardDescription>Real-time voting participation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Votes Cast</p>
            <p className="text-2xl font-semibold">{data.casted_votes}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expected Voters</p>
            <p className="text-2xl font-semibold">{data.expected_voters}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Turnout</p>
            <p className="text-2xl font-semibold">{turnoutDisplay}</p>
            {data.expected_voters === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Turnout undefined (0 voters)
              </p>
            )}
          </div>
        </div>

        {/* [Phase 5: Officer controls & realtime updates to be added - T027-T031] */}
      </CardContent>
    </Card>
  );
}
