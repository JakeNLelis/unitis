import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getElectionState, cn } from "@/lib/utils";
import {
  getTurnoutSnapshot,
  getTurnoutAdjustments,
} from "@/lib/turnout/read-model";
import { InstitutionalDataTable } from "@/components/institutional/data-table";
import { InstitutionalPieChart } from "@/components/institutional/pie-chart";
import { InstitutionalCountdown } from "@/components/institutional/countdown";
import { TurnoutLiveClient } from "@/components/turnout-live-client";
import { format } from "date-fns";
import { archivo } from "@/lib/fonts";
import type { TurnoutPageProps } from "@/lib/types/public";
import type React from "react";

// @CodeScene(disable:"Complex Method","Large Method")
export default async function TurnoutPage({ params }: TurnoutPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: election, error } = await supabase
    .from("elections")
    .select("election_id, name, start_date, end_date, election_type")
    .eq("election_id", id)
    .single();

  if (error || !election) {
    notFound();
  }

  const state = getElectionState(election.start_date, election.end_date);

  if (state === "upcoming") {
    return (
      <main className="min-h-screen bg-background pb-20 flex flex-col items-center justify-center">
        <div className="container max-w-xl mx-auto px-6 text-center space-y-6 mt-20">
          <Link
            href={`/elections/${id}`}
            className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-all duration-200 inline-block mb-4"
          >
            ← Back to {election.name}
          </Link>
          <div className="p-12 border-2 border-foreground bg-surface-low space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h1
              className={cn(
                "text-3xl font-black uppercase tracking-tight",
                archivo.className,
              )}
            >
              Voting Has Not Commenced
            </h1>
            <p className="text-sm text-muted-foreground">
              The live turnout ledger for{" "}
              <span className="font-semibold text-foreground">
                {election.name}
              </span>{" "}
              will become available once the voting period starts on{" "}
              <span className="font-semibold text-foreground">
                {new Date(election.start_date).toLocaleString()}
              </span>
              .
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (state === "ended") {
    redirect(`/archive/${id}`);
  }

  const [snapshot, adjustments] = await Promise.all([
    getTurnoutSnapshot(id),
    getTurnoutAdjustments(id),
  ]);

  if (!snapshot) {
    return (
      <main className="container max-w-4xl mx-auto px-4 py-10">
        <p className="text-muted-foreground">Turnout data unavailable.</p>
      </main>
    );
  }

  const expectedVoters = snapshot.expected_voters;
  const quorumTarget =
    expectedVoters === 0 ? 0 : Math.floor(expectedVoters / 2) + 1;
  const quorumMet = snapshot.casted_votes >= quorumTarget;

  const isCampusWide = election.election_type?.toLowerCase() === "campus-wide";
  let facultyBreakdownData: Array<{
    Faculty: React.ReactNode;
    "Expected Voters": React.ReactNode;
    "Casted Votes": React.ReactNode;
    Turnout: React.ReactNode;
  }> | null = null;

  if (isCampusWide) {
    const { data: voterRows } = await supabase
      .from("voters")
      .select("is_voted, faculty_id, faculties(name, acronym)")
      .eq("election_id", id);

    const facultyTotals = new Map<
      string,
      { name: string; expected: number; casted: number }
    >();

    for (const voter of voterRows ?? []) {
      const facultyObj = Array.isArray(voter.faculties) ? voter.faculties[0] : voter.faculties;
      const facultyName = facultyObj?.acronym || facultyObj?.name || "Unassigned";
      const facultyKey = voter.faculty_id || "unassigned";
      const existing = facultyTotals.get(facultyKey) ?? {
        name: facultyName,
        expected: 0,
        casted: 0,
      };

      existing.expected += 1;
      if (voter.is_voted) {
        existing.casted += 1;
      }

      facultyTotals.set(facultyKey, existing);
    }

    facultyBreakdownData = Array.from(facultyTotals.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((row) => {
        const turnout =
          row.expected === 0 ? 0 : (row.casted / row.expected) * 100;

        return {
          Faculty: (
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
              {row.name}
            </span>
          ),
          "Expected Voters": (
            <span className="font-semibold tabular-nums">{row.expected}</span>
          ),
          "Casted Votes": (
            <span className="font-semibold tabular-nums">{row.casted}</span>
          ),
          Turnout: row.expected === 0 ? "—" : `${turnout.toFixed(1)}%`,
        };
      });
  }

  const adjustmentData = adjustments.map((adj) => ({
    Date: format(new Date(adj.created_at), "MMM d, HH:mm"),
    Classification:
      adj.expected_voters_delta !== null
        ? "Expected Voters Adjustment"
        : "Manual Vote Adjustment",
    Delta:
      adj.casted_votes_delta !== null ? (
        <span
          className={
            adj.casted_votes_delta > 0
              ? "text-green-600 font-bold"
              : "text-destructive font-bold"
          }
        >
          {adj.casted_votes_delta > 0 ? "+" : ""}
          {adj.casted_votes_delta}
        </span>
      ) : (
        "—"
      ),
    "Expected Delta":
      adj.expected_voters_delta !== null ? (
        <span
          className={
            adj.expected_voters_delta > 0
              ? "text-green-600 font-bold"
              : "text-destructive font-bold"
          }
        >
          {adj.expected_voters_delta > 0 ? "+" : ""}
          {adj.expected_voters_delta}
        </span>
      ) : (
        "—"
      ),
    "Verification Note": (
      <span className="text-xs text-muted-foreground line-clamp-1 italic">
        {adj.reason || "Official adjustment"}
      </span>
    ),
  }));

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Live subscription handled by this client component */}
      <TurnoutLiveClient electionId={id} initialSnapshot={snapshot} />

      {/* Institutional Status Marquee */}

      <div className="container max-w-5xl mx-auto px-6 mt-12 space-y-16">
        {/* Asymmetric Institutional Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <Link
              href={`/elections/${id}`}
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-all duration-200 block mb-6"
            >
              ← Back to {election.name}
            </Link>
            <h1
              className={cn(
                "text-6xl font-black tracking-tighter uppercase leading-[0.85] text-foreground",
                archivo.className,
              )}
            >
              Official <br /> Turnout Ledger
            </h1>
            <p className="mt-8 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Real-time audit of the voting activity for{" "}
              <span className="text-foreground font-semibold underline decoration-primary/30 underline-offset-4">
                {election.name}
              </span>
              . This ledger integrates direct ballot counts with administrative
              voter base adjustments.
            </p>
          </div>

          <div className="flex flex-col items-end text-right">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Authenticated Ballots
                </p>
                <p
                  className={cn(
                    "text-5xl font-black tabular-nums text-primary",
                    archivo.className,
                  )}
                >
                  {snapshot.casted_votes}
                </p>
              </div>
              <div className="h-px w-16 bg-border ml-auto" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Total Eligible Population
                </p>
                <p
                  className={cn(
                    "text-5xl font-black tabular-nums text-foreground",
                    archivo.className,
                  )}
                >
                  {snapshot.expected_voters}
                </p>
              </div>
            </div>
          </div>

          {/* Quorum Status */}
          <div
            className={cn(
              "mt-8 p-6 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              quorumMet
                ? "bg-green-50 dark:bg-green-950/30"
                : "bg-amber-50 dark:bg-amber-950/30",
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "size-3 rounded-full animate-pulse",
                  quorumMet ? "bg-green-500" : "bg-amber-500",
                )}
              />
              <div>
                <p
                  className={cn(
                    "text-lg font-black uppercase tracking-tight",
                    archivo.className,
                  )}
                >
                  {quorumMet ? "Quorum Established" : "Quorum Not Met"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {snapshot.casted_votes} of {quorumTarget} required votes (
                  {expectedVoters} eligible)
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  Base {snapshot.expected_voters_base} + adjustments{" "}
                  {snapshot.expected_voters_delta}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isCampusWide && (
          <section className="space-y-6">
            <div className="flex items-baseline justify-between">
              <h2
                className={cn(
                  "text-2xl font-black uppercase tracking-tight",
                  archivo.className,
                )}
              >
                Breakdown by Faculty
              </h2>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Campus-wide ledger
              </span>
            </div>
            <InstitutionalDataTable
              headers={[
                "Faculty",
                "Expected Voters",
                "Casted Votes",
                "Turnout",
              ]}
              data={
                facultyBreakdownData && facultyBreakdownData.length > 0
                  ? facultyBreakdownData
                  : [
                      {
                        Empty:
                          "No faculty-level voter records found for this election.",
                      },
                    ]
              }
            />
          </section>
        )}

        {/* Section: Aggregate Metrics */}
        <section className="flex flex-col md:flex-row items-center gap-20 py-10">
          <InstitutionalPieChart
            percentage={snapshot.turnout_percentage}
            label="Turnout"
            size={200}
            strokeWidth={24}
          />

          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h2
                className={cn(
                  "text-3xl font-black uppercase tracking-tight",
                  archivo.className,
                )}
              >
                Official Participation Velocity
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                The current participation rate reflects authenticated ballots
                cast relative to the verified population base. This metric
                updates in real-time as administrative adjustments are logged.
              </p>
            </div>

            <InstitutionalCountdown
              targetDate={election.end_date}
              className="pt-6"
            />
          </div>
        </section>

        {/* Section: Official Adjustment Log */}
        <section>
          <div className="mb-10 items-baseline">
            <h2
              className={cn(
                "text-2xl font-black uppercase tracking-tight",
                archivo.className,
              )}
            >
              Adjustment ledger
            </h2>
          </div>

          <InstitutionalDataTable
            headers={[
              "Date",
              "Classification",
              "Delta",
              "Expected Delta",
              "Verification Note",
            ]}
            data={
              adjustmentData.length > 0
                ? adjustmentData
                : [
                    {
                      Empty:
                        "Official records indicate no manual adjustments for this session.",
                    },
                  ]
            }
          />
        </section>
      </div>
    </main>
  );
}
