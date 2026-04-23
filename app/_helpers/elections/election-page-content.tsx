import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getElectionState, cn } from "@/lib/utils";
import { EventActionPanel } from "@/components/event-action-panel";
import type { ElectionState } from "@/lib/types/election";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Flag, ArrowLeft } from "lucide-react";
import { InstitutionalCountdown } from "@/components/institutional/countdown";
import { CandidateRegistry } from "@/components/institutional/candidate-registry";
import { archivo } from "@/lib/fonts";
import type { NormalizedCandidate } from "@/lib/types/public";

function ElectionHeroSection({
  election,
  stateLabel,
  stateVariant,
  targetDate,
  countdownLabel,
  countdownExpiredLabel,
}: {
  election: {
    name: string;
    election_type: string;
    start_date: string;
    end_date: string;
  };
  stateLabel: string;
  stateVariant: "default" | "secondary";
  targetDate: string;
  countdownLabel: string;
  countdownExpiredLabel: string;
}) {
  return (
    <div className="relative overflow-hidden bg-background">
      <div className="flex flex-col md:flex-row justify-between gap-12 relative z-10">
        <div className="space-y-6 flex-1">
          <div className="space-y-2">
            <Badge
              variant={stateVariant}
              className="rounded-none font-black tracking-widest uppercase"
            >
              {stateLabel}
            </Badge>
            <h1
              className={cn(
                "text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]",
                archivo.className,
              )}
            >
              {election.name}
            </h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-4">
            <div className="py-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-1">
                <CalendarDays className="size-3" />
                Voting Window
              </p>
              <p className={cn("text-lg font-black", archivo.className)}>
                {new Date(election.start_date).toLocaleDateString()} -{" "}
                {new Date(election.end_date).toLocaleDateString()}
              </p>
            </div>
            <div className="py-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-1">
                <Flag className="size-3" />
                Classification
              </p>
              <p className={cn("text-lg font-black", archivo.className)}>
                {election.election_type}
              </p>
            </div>
          </div>
        </div>

        <div className="md:w-px md:h-64 bg-foreground/10 hidden md:block" />

        <div className="md:w-72 flex flex-col justify-center">
          <InstitutionalCountdown
            targetDate={targetDate}
            label={countdownLabel}
            expiredLabel={countdownExpiredLabel}
          />
          <p className="mt-6 text-[10px] leading-relaxed font-bold text-muted-foreground/60 uppercase tracking-wider">
            This session metadata is cryptographically synchronized with the
            plenum core registry.
          </p>
        </div>
      </div>
    </div>
  );
}

function ElectionQuickActionsSection({
  electionId,
  electionName,
  state,
}: {
  electionId: string;
  electionName: string;
  state: ElectionState;
}) {
  return (
    <div className="space-y-6">
      <EventActionPanel
        electionId={electionId}
        electionName={electionName}
        state={state}
        variant="compact"
      />
    </div>
  );
}

function ElectionCandidatesSection({
  candidates,
}: {
  candidates: NormalizedCandidate[];
}) {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <div>
          <h2
            className={cn(
              "text-4xl font-black uppercase tracking-tighter",
              archivo.className,
            )}
          >
            Registry of Candidates
          </h2>
        </div>
      </div>

      <CandidateRegistry candidates={candidates} />
    </div>
  );
}

export async function ElectionPageContent({ id }: { id: string }) {
  const supabase = await createClient();

  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select("*")
    .eq("election_id", id)
    .single();

  if (electionError || !election) {
    notFound();
  }

  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select(
      `
      candidate_id,
      full_name,
      photo,
      position:positions(title),
      partylist:partylists(name, acronym)
    `,
    )
    .eq("election_id", id)
    .eq("application_status", "approved");

  if (candidatesError) {
    console.error("Candidates fetch error:", candidatesError);
  }

  const normalizedCandidates: NormalizedCandidate[] = (candidates || []).map(
    (candidate) => {
      const position = Array.isArray(candidate.position)
        ? candidate.position[0]
        : candidate.position;
      const partylist = Array.isArray(candidate.partylist)
        ? candidate.partylist[0]
        : candidate.partylist;

      return {
        candidate_id: candidate.candidate_id,
        full_name: candidate.full_name,
        photo: candidate.photo,
        position_title: position?.title || "Unknown Position",
        partylist_name: partylist?.name || null,
        partylist_acronym: partylist?.acronym || null,
      };
    },
  );

  const state = getElectionState(
    election.start_date,
    election.end_date,
  ) as ElectionState;

  if (state === "ended") {
    redirect(`/archive/${id}`);
  }

  const stateLabel = state === "active" ? "Happening now" : "Upcoming election";
  const stateVariant = state === "active" ? "default" : "secondary";
  const targetDate =
    state === "active" ? election.end_date : election.start_date;
  const countdownLabel =
    state === "active" ? "Ballot Session Termination" : "Election Commencement";
  const countdownExpiredLabel =
    state === "active" ? "Registry Concluded" : "Institutional Session Live";

  return (
    <main className="container max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="space-y-16">
        <div className="space-y-10">
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home Page
            </Link>
          </div>

          <ElectionHeroSection
            election={election}
            stateLabel={stateLabel}
            stateVariant={stateVariant}
            targetDate={targetDate}
            countdownLabel={countdownLabel}
            countdownExpiredLabel={countdownExpiredLabel}
          />

          <ElectionQuickActionsSection
            electionId={id}
            electionName={election.name}
            state={state}
          />
        </div>

        <ElectionCandidatesSection candidates={normalizedCandidates} />
      </div>
    </main>
  );
}
