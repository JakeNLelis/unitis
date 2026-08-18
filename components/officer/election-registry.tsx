import { createAdminClient } from "@/lib/supabase/admin";
import { requireElectionManager } from "@/lib/auth";
import { Election } from "@/lib/types/election";
import { cn } from "@/lib/utils";
import { Calendar, Info, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InstitutionalListItem } from "@/components/institutional/list-item";
import { getElectionPermissionsForActor } from "@/lib/election-permissions";

function getElectionStatus(election: Election): {
  label: string;
  className: string;
} {
  const now = new Date();
  const start = new Date(election.start_date);
  const end = new Date(election.end_date);
  const candStart = election.candidacy_start_date
    ? new Date(election.candidacy_start_date)
    : null;
  const candEnd = election.candidacy_end_date
    ? new Date(election.candidacy_end_date)
    : null;

  if (election.is_archived)
    return {
      label: "Archived",
      className: "bg-muted text-muted-foreground border-muted",
    };
  if (now >= start && now <= end)
    return {
      label: "Voting Open",
      className: "bg-green-600 text-white border-green-600",
    };
  if (candStart && candEnd && now >= candStart && now <= candEnd)
    return {
      label: "Filing Open",
      className: "bg-blue-600 text-white border-blue-600",
    };
  if (now < start)
    return {
      label: "Upcoming",
      className: "bg-amber-500 text-white border-amber-500",
    };
  return {
    label: "Ended",
    className: "bg-foreground text-background border-foreground",
  };
}

export async function OfficerElectionRegistry({
  basePath = "/officer/elections",
}: {
  basePath?: string;
} = {}) {
  const { profile, officer } = await requireElectionManager();

  const supabase = await createAdminClient();

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

  const actor = {
    role: profile.role,
    officer: officer
      ? {
          seb_officer_id: officer.seb_officer_id,
          campus: officer.campus,
          faculty_code: officer.faculty_code,
        }
      : null,
  };

  const visibleElections = ((elections || []) as Election[]).filter(
    (election) =>
      getElectionPermissionsForActor(
        {
          election_type: election.election_type,
          created_by: election.created_by,
          owner_campus: election.owner_campus,
          owner_faculty_code: election.owner_faculty_code,
          access_policy_locked: election.access_policy_locked,
        },
        actor,
      ).canView,
  );

  if (visibleElections.length === 0) {
    return (
      <div className="p-20 border border-dashed border-border flex flex-col items-center gap-6 bg-surface-low">
        <Info className="size-10 text-muted-foreground/30" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          No Accessible Elections // Scope Restricted
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border border-y border-border ring-1 ring-border bg-white shadow-sm overflow-hidden">
      {visibleElections.map((election) => {
        const status = getElectionStatus(election);
        return (
          <InstitutionalListItem
            key={election.election_id}
            title={election.name}
            subtitle={election.election_type}
            href={`${basePath}/${election.election_id}`}
            className="group hover:bg-primary/2 transition-all py-8 px-10"
            action={
              <div className="size-10 flex items-center justify-center border border-border group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <ChevronRight className="size-5" />
              </div>
            }
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 flex-1 w-full">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Election Cycle
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold font-mono">
                    <Calendar className="size-3 text-muted-foreground" />
                    <span>
                      {new Date(election.start_date).toLocaleDateString()}
                    </span>
                    <span className="text-muted-foreground opacity-30">—</span>
                    <span>
                      {new Date(election.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {election.candidacy_end_date && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Filing Close
                    </p>
                    <p className="text-xs font-bold font-mono">
                      {new Date(
                        election.candidacy_end_date,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="sm:ml-auto flex items-center gap-4 sm:mr-6">
                <Badge
                  className={cn(
                    "rounded-none text-[10px] font-black uppercase tracking-widest px-3 py-1 border",
                    status.className,
                  )}
                >
                  {status.label}
                </Badge>
              </div>
            </div>
          </InstitutionalListItem>
        );
      })}
    </div>
  );
}
