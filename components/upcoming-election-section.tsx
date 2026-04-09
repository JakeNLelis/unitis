"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";

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
  const router = useRouter();
  const [buttonHovered, setButtonHovered] = useState(false);

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={`Open ${election.name} election details`}
      className={cn(
        "cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg",
        !buttonHovered && "hover:bg-accent/20 hover:border-primary/50",
      )}
      onClick={() => router.push(`/elections/${election.election_id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/elections/${election.election_id}`);
        }
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{election.name}</CardTitle>
            <CardDescription>{election.election_type}</CardDescription>
            <p className="mt-2 text-sm text-muted-foreground inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              Starts on {new Date(election.start_date).toLocaleDateString()}
            </p>
          </div>
          <Badge variant="secondary">Upcoming</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full justify-between"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
          onFocus={() => setButtonHovered(true)}
          onBlur={() => setButtonHovered(false)}
        >
          <Link href={`/elections/${election.election_id}/check-eligibility`}>
            Check eligibility
            <ArrowRight className="size-4" />
          </Link>
        </Button>

        <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <Clock3 className="size-3.5" />
          Open the card to view full event actions.
        </p>
      </CardContent>
    </Card>
  );
}

export interface UpcomingElectionSectionProps {
  elections: Array<{
    election_id: string;
    name: string;
    election_type: string;
    start_date: string;
    end_date: string;
  }>;
}

// T014: Upcoming Election section UI behavior with exact empty-state message
export function UpcomingElectionSection({
  elections,
}: UpcomingElectionSectionProps) {
  return (
    <section className="space-y-4" aria-label="Upcoming elections">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-secondary text-foreground">
              <CalendarDays className="size-4" />
            </span>
            Upcoming Election
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Elections scheduled for the future
          </p>
        </div>
        <Badge variant="secondary">{elections?.length ?? 0} upcoming</Badge>
      </div>

      {!elections || elections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No upcoming election for now
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4" role="list">
          {elections.map((election) => (
            <div key={election.election_id} role="listitem">
              <ElectionCard election={election} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
