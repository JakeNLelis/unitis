"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Activity, ArrowRight, CalendarDays, Vote } from "lucide-react";

interface ElectionCardProps {
  election: {
    election_id: string;
    name: string;
    election_type: string;
    start_date: string;
    end_date: string;
  };
}

// T017: Election card with full clickability
// T018: Accessibility labels and focus states
function ElectionCard({ election }: ElectionCardProps) {
  return (
    <Link
      href={`/elections/${election.election_id}`}
      className="focus-visible:outline-none rounded-lg"
      aria-label={`Open ${election.name} election details`}
    >
      <Card className="cursor-pointer hover:border-primary/50 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">{election.name}</CardTitle>
              <CardDescription>{election.election_type}</CardDescription>
            </div>
            <Badge variant="default">Live</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              Voting window
            </p>
            <p className="mt-1 text-sm font-medium">
              {new Date(election.start_date).toLocaleDateString()} -{" "}
              {new Date(election.end_date).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Vote className="size-3.5" />
                Vote now
              </span>
              <span className="inline-flex items-center gap-1">
                <Activity className="size-3.5" />
                Live turnout
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-foreground font-medium">
              Open
              <ArrowRight className="size-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export interface HappeningNowSectionProps {
  elections: Array<{
    election_id: string;
    name: string;
    election_type: string;
    start_date: string;
    end_date: string;
  }>;
}

// T013: Happening Now section UI behavior
export function HappeningNowSection({ elections }: HappeningNowSectionProps) {
  // Only show section if there are active elections
  if (!elections || elections.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4" aria-label="Currently happening elections">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Activity className="size-4" />
            </span>
            Happening Now
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Elections currently in progress. Click on any election to view
            details and actions.
          </p>
        </div>
        <Badge variant="default">{elections.length} live</Badge>
      </div>
      <div className="grid gap-4" role="list">
        {elections.map((election) => (
          <div key={election.election_id} role="listitem">
            <ElectionCard election={election} />
          </div>
        ))}
      </div>
    </section>
  );
}
