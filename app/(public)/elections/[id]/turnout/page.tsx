import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getElectionState, cn } from "@/lib/utils";
import { getTurnoutSnapshot, getTurnoutAdjustments } from "@/lib/turnout/read-model";
import { InstitutionalDataTable } from "@/components/institutional/data-table";
import { InstitutionalPieChart } from "@/components/institutional/pie-chart";
import { InstitutionalCountdown } from "@/components/institutional/countdown";
import { InstitutionalListItem } from "@/components/institutional/list-item";
import { TurnoutLiveClient } from "@/components/turnout-live-client";
import { format } from "date-fns";
import { archivo } from "@/lib/fonts";

interface TurnoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function TurnoutPage({ params }: TurnoutPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: election, error } = await supabase
    .from("elections")
    .select("election_id, name, start_date, end_date")
    .eq("election_id", id)
    .single();

  if (error || !election) {
    notFound();
  }

  const state = getElectionState(election.start_date, election.end_date);

  if (state !== "active") {
    redirect(`/archive/${id}`);
  }

  const snapshot = await getTurnoutSnapshot(id);
  const adjustments = await getTurnoutAdjustments(id);

  if (!snapshot) {
    return (
      <main className="container max-w-4xl mx-auto px-4 py-10">
        <p className="text-muted-foreground">Turnout data unavailable.</p>
      </main>
    );
  }

  const adjustmentData = adjustments.map(adj => ({
    "Date": format(new Date(adj.created_at), "MMM d, HH:mm"),
    "Classification": adj.expected_voters_value !== null ? "Voter Masterlist Update" : "Manual Vote Adjustment",
    "Delta": adj.casted_votes_delta !== null 
      ? <span className={adj.casted_votes_delta > 0 ? "text-green-600 font-bold" : "text-destructive font-bold"}>
          {adj.casted_votes_delta > 0 ? '+' : ''}{adj.casted_votes_delta}
        </span>
      : "—",
    "New Range": adj.expected_voters_value ?? "—",
    "Verification Note": <span className="text-xs text-muted-foreground line-clamp-1 italic">{adj.reason || "Official adjustment"}</span>
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
            <h1 className={cn("text-6xl font-black tracking-tighter uppercase leading-[0.85] text-foreground", archivo.className)}>
              Official <br /> Turnout Ledger
            </h1>
            <p className="mt-8 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Real-time audit of the voting activity for <span className="text-foreground font-semibold underline decoration-primary/30 underline-offset-4">{election.name}</span>. 
              This ledger integrates direct ballot counts with administrative voter base adjustments.
            </p>
          </div>

          <div className="flex flex-col items-end text-right">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Authenticated Ballots</p>
                <p className={cn("text-5xl font-black tabular-nums text-primary", archivo.className)}>{snapshot.casted_votes}</p>
              </div>
              <div className="h-px w-16 bg-border ml-auto" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Eligible Population</p>
                <p className={cn("text-5xl font-black tabular-nums text-foreground", archivo.className)}>{snapshot.expected_voters}</p>
              </div>
            </div>
          </div>
        </div>

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
              <h2 className={cn("text-3xl font-black uppercase tracking-tight", archivo.className)}>
                Official Participation Velocity
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                The current participation rate reflects authenticated ballots cast relative to the verified population base. 
                This metric updates in real-time as administrative adjustments are logged.
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
            <h2 className={cn("text-2xl font-black uppercase tracking-tight", archivo.className)}>
              Adjustment ledger
            </h2>
          </div>

          <InstitutionalDataTable 
            headers={["Date", "Classification", "Delta", "New Range", "Verification Note"]}
            data={adjustmentData.length > 0 ? adjustmentData : [{ "Empty": "Official records indicate no manual adjustments for this session." }]}
          />
        </section>

      </div>
    </main>
  );
}
