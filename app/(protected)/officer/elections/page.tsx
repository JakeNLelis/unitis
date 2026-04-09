import { createClient } from "@/lib/supabase/server";
import { getSEBOfficer } from "@/lib/auth";
import { Election } from "@/lib/types/election";
import { toDateStr, cn } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Calendar, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { archivo } from "@/lib/fonts";
import { InstitutionalListItem } from "@/components/institutional/list-item";

function getElectionStatus(election: Election): {
  label: string;
  className: string;
} {
  const today = toDateStr(new Date());
  const start = toDateStr(election.start_date);
  const end = toDateStr(election.end_date);
  const candStart = election.candidacy_start_date
    ? toDateStr(election.candidacy_start_date)
    : null;
  const candEnd = election.candidacy_end_date
    ? toDateStr(election.candidacy_end_date)
    : null;

  if (election.is_archived) return { label: "Archived", className: "bg-muted text-muted-foreground" };
  if (today >= start && today <= end)
    return { label: "Voting Open", className: "bg-green-600 text-white" };
  if (candStart && candEnd && today >= candStart && today <= candEnd)
    return { label: "Filing Open", className: "bg-blue-600 text-white" };
  if (today < start) return { label: "Upcoming", className: "bg-amber-500 text-white" };
  return { label: "Ended", className: "bg-foreground text-background" };
}

async function ElectionsList() {
  const officer = await getSEBOfficer();
  if (!officer) return null;

  const supabase = await createClient();

  const { data: elections, error } = await supabase
    .from("elections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 border-2 border-destructive bg-destructive/5 text-destructive font-bold uppercase tracking-widest text-[10px]">
        Critical System Error: Failed to retrieve election registry.
      </div>
    );
  }

  if (!elections || elections.length === 0) {
    return (
      <div className="p-20 border border-dashed border-border flex flex-col items-center gap-6 bg-surface-low">
        <Info className="size-10 text-muted-foreground/30" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Registry Empty // Awaiting Initialization
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border border-y border-border ring-1 ring-border bg-white shadow-sm overflow-hidden">
      {(elections as Election[]).map((election) => {
        const status = getElectionStatus(election);
        return (
          <InstitutionalListItem
            key={election.election_id}
            title={election.name}
            subtitle={election.election_type}
            className="group hover:bg-primary/5 transition-all py-8 px-10"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-12 flex-1">
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Election Cycle</p>
                  <div className="flex items-center gap-2 text-xs font-bold font-mono">
                    <Calendar className="size-3 text-muted-foreground" />
                    <span>{new Date(election.start_date).toLocaleDateString()}</span>
                    <span className="text-muted-foreground opacity-30">—</span>
                    <span>{new Date(election.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
                {election.candidacy_end_date && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Filing Close</p>
                    <p className="text-xs font-bold font-mono">
                      {new Date(election.candidacy_end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="ml-auto flex items-center gap-8">
                <Badge className={cn("rounded-none text-[10px] font-black uppercase tracking-widest px-3 py-1", status.className)}>
                  {status.label}
                </Badge>
                <Link
                  href={`/officer/elections/${election.election_id}`}
                  className="size-10 flex items-center justify-center border border-border group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                >
                  <ChevronRight className="size-5" />
                </Link>
              </div>
            </div>
          </InstitutionalListItem>
        );
      })}
    </div>
  );
}

export default function ElectionsPage() {
  return (
    <div className="container max-w-6xl mx-auto px-6 space-y-16 py-12">
      <div className="flex justify-between items-end border-b-2 border-foreground pb-10">
        <div className="space-y-4">
          <h1 className={cn("text-6xl font-black uppercase tracking-tighter leading-none", archivo.className)}>
            Elections
          </h1>
          <p className="text-sm font-medium text-muted-foreground max-w-md">
            The authoritative registry of all university-wide and localized election cycles managed by the Student Election Board.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-none font-black uppercase tracking-widest h-14 px-8">
          <Link href="/officer/elections/new">
            <Plus className="size-5 mr-3" />
            Initialize New Election
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-baseline justify-between mb-2">
           <h2 className={cn("text-xs font-black uppercase tracking-[0.25em] text-muted-foreground", archivo.className)}>
             Election Registry
           </h2>
        </div>
        
        <Suspense
          fallback={
            <div className="space-y-4 border-y border-border divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-surface-low animate-pulse" />
              ))}
            </div>
          }
        >
          <ElectionsList />
        </Suspense>
      </div>
    </div>
  );
}
