"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { archivo } from "@/lib/fonts";
import { ArrowRight, CalendarDays } from "lucide-react";
import type {
  UpcomingElectionCardProps,
  UpcomingElectionSectionProps,
} from "@/lib/types/components";

function ElectionCard({ election }: UpcomingElectionCardProps) {
  const router = useRouter();
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const showCardHover = isCardHovered && !isButtonHovered;

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`Open ${election.name} election details`}
      className={cn(
        "group cursor-pointer transition-all duration-200 py-6 px-4",
        showCardHover ? "shadow-lg" : "bg-transparent",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
      )}
      onClick={() => router.push(`/elections/${election.election_id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/elections/${election.election_id}`);
        }
      }}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => {
        setIsCardHovered(false);
        setIsButtonHovered(false);
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div>
            <h3
              className={cn(
                "text-xl font-black uppercase tracking-tight",
                archivo.className,
              )}
            >
              {election.name}
            </h3>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {election.election_type}
          </p>
          <p className="text-sm font-medium text-foreground/60 inline-flex items-center gap-1.5 pt-1">
            <CalendarDays className="size-4 text-primary" />
            Registration opens{" "}
            {new Date(election.start_date).toLocaleDateString()}
          </p>
        </div>

        <Button
          asChild
          variant={isButtonHovered ? "default" : "outline"}
          size="sm"
          className="min-w-50 justify-between font-black uppercase tracking-widest transition-all"
          onClick={(event) => event.stopPropagation()}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          <Link href={`/elections/${election.election_id}/check-eligibility`}>
            Check eligibility
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
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
      </div>

      {!elections || elections.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-border rounded-lg bg-surface-lowest">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            No upcoming session entries recorded
          </p>
        </div>
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
