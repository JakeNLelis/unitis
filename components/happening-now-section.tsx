"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, CalendarDays, Vote } from "lucide-react";
import type {
  HappeningNowElectionCardProps,
  HappeningNowSectionProps,
} from "@/lib/types/components";

// T017: Election card with full clickability
// T018: Accessibility labels and focus states
function ElectionCard({ election }: HappeningNowElectionCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/elections/${election.election_id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/elections/${election.election_id}`);
        }
      }}
      className="focus-visible:outline-none rounded-lg group cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`Open ${election.name} election details`}
    >
      <Card className="hover:border-primary/50 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">{election.name}</CardTitle>
              <CardDescription>{election.election_type}</CardDescription>
            </div>
            <Badge variant="default">Live</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="flex items-center justify-between text-sm flex-wrap gap-y-3">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="default"
                className="h-9 px-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-none border-2 border-primary hover:bg-black hover:text-white hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/elections/${election.election_id}/vote`);
                }}
              >
                <Vote className="size-3.5" />
                Vote now
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-none border-2 border-foreground hover:bg-black hover:text-gray-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/elections/${election.election_id}/turnout`);
                }}
              >
                <Activity className="size-3.5" />
                Turnout
              </Button>
            </div>
            <span className="inline-flex items-center gap-1 text-foreground font-medium text-xs ml-auto">
              More Info
              <ArrowRight className="size-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
