import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSEBOfficer } from "@/lib/auth";
import { Election, Position, CandidateWithDetails } from "@/lib/types/election";
import { getTodayStr, cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ExternalLink,
  Users,
  BarChart3,
} from "lucide-react";
import { AddPositionForm } from "./add-position-form";
import { CandidateActions } from "./candidate-actions";
import { CopyableUrl } from "./copyable-url";
import { PositionList } from "./position-list";
import { EditElectionDates } from "./edit-election-dates";
import { DeleteElectionButton } from "./delete-election-button";
import { ElectionResults } from "./election-results";
import { VoterMasterlist } from "./voter-masterlist";
import { TurnoutAdjustmentForm } from "./turnout-adjustment-form";
import { archivo } from "@/lib/fonts";
import { InstitutionalDataTable } from "@/components/institutional/data-table";
import { InstitutionalListItem } from "@/components/institutional/list-item";

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-600 rounded-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive" className="rounded-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5">Rejected</Badge>;
    default:
      return <Badge variant="secondary" className="rounded-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5">Pending</Badge>;
  }
}

async function ElectionDetail({ electionId }: { electionId: string }) {
  const officer = await getSEBOfficer();
  if (!officer) return null;

  const supabase = await createClient();

  // Fetch election
  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select("*")
    .eq("election_id", electionId)
    .single();

  if (electionError || !election) {
    notFound();
  }

  // Use admin client to bypass RLS for data fetching
  const adminSupabase = await createAdminClient();

  // Fetch positions
  const { data: positions } = await supabase
    .from("positions")
    .select("*")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  // Fetch candidates with position, course, and partylist info (admin client to bypass RLS)
  const { data: candidates } = await adminSupabase
    .from("candidates")
    .select(
      "*, positions(title), courses(name, acronym), partylists(name, acronym)",
    )
    .eq("election_id", electionId)
    .order("created_at", { ascending: false });

  // Fetch voters
  const { data: voters } = await adminSupabase
    .from("voters")
    .select("voter_id, student_id, is_voted")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  const votersData = (voters || []) as {
    voter_id: string;
    student_id: string;
    is_voted: boolean;
  }[];

  const electionData = election as Election;
  const positionsData = (positions || []) as Position[];
  const candidatesData = (candidates || []) as CandidateWithDetails[];

  const today = getTodayStr();
  const candidacyOpen =
    electionData.candidacy_start_date &&
    electionData.candidacy_end_date &&
    today >= electionData.candidacy_start_date.slice(0, 10) &&
    today <= electionData.candidacy_end_date.slice(0, 10);

  const votingStarted =
    electionData.start_date && today >= electionData.start_date.slice(0, 10);

  // Build the base URL from request headers
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = `${proto}://${host}`;

  const applicationUrl = `/elections/${electionId}/apply`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-6xl mx-auto px-6 space-y-12">
        {/* Institutional Navigation */}
        <div className="pt-8 flex justify-between items-center group">
          <Link
            href="/officer/elections"
            className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-all flex items-center gap-2"
          >
            ← Back to System Index
          </Link>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
             Officer Context: SEB Admin
          </div>
        </div>

        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-2 border-foreground pb-12">
          <div className="max-w-2xl space-y-6">
            <div>
              {candidacyOpen && (
                <span className="inline-block px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest mb-4">
                  Live Application Sync
                </span>
              )}
              <h1 className={cn("text-6xl font-black tracking-tighter uppercase leading-[0.85]", archivo.className)}>
                {electionData.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Category:</span>
                <span className="text-xs font-bold uppercase tracking-wide text-foreground">{electionData.election_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">ID:</span>
                <span className="text-xs font-mono font-medium text-foreground">{electionId.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <DeleteElectionButton
              electionId={electionId}
              electionName={electionData.name}
            />
          </div>
        </div>

        {/* Temporal Controls & Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className={cn("text-xl font-black uppercase tracking-tight", archivo.className)}>
                  Phase Schedule
                </h2>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Temporal Audit</span>
              </div>
              <div className="bg-surface-low border-y border-border px-8 py-6">
                <EditElectionDates
                  electionId={electionId}
                  candidacyStartDate={electionData.candidacy_start_date}
                  candidacyEndDate={electionData.candidacy_end_date}
                  startDate={electionData.start_date}
                  endDate={electionData.end_date}
                />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className={cn("text-xl font-black uppercase tracking-tight", archivo.className)}>
                  System Access Points
                </h2>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Public Links</span>
              </div>
              <div className="divide-y divide-border border-y border-border bg-white ring-1 ring-border">
                {candidacyOpen && (
                  <InstitutionalListItem 
                    title="Candidacy Portal" 
                    subtitle="Public entry point for student election aspirants"
                    className="hover:bg-primary/5"
                  >
                     <div className="w-full max-w-md ml-auto">
                        <CopyableUrl url={`${baseUrl}${applicationUrl}`} />
                     </div>
                  </InstitutionalListItem>
                )}
                <InstitutionalListItem 
                  title="Voter Terminal" 
                  subtitle="Authorized access for validated university voters"
                  className="hover:bg-primary/5"
                >
                   <div className="w-full max-w-md ml-auto">
                      <CopyableUrl url={`${baseUrl}/elections/${electionId}/vote`} />
                   </div>
                </InstitutionalListItem>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 bg-surface-low p-8 border border-border self-start">
             <h3 className={cn("text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6", archivo.className)}>
               Quick Reports
             </h3>
             <ul className="space-y-4">
                <li>
                  <Link href={`/elections/${electionId}/turnout`} className="flex items-center justify-between group">
                    <span className="text-xs font-bold uppercase tracking-wide text-foreground group-hover:text-primary underline decoration-border group-hover:decoration-primary transition-all">Live Turnout Ledger</span>
                    <BarChart3 className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </li>
             </ul>
          </div>
        </div>

        {/* Positions Section */}
        <section>
          <div className="mb-8 flex items-baseline justify-between group">
            <h2 className={cn("text-2xl font-black uppercase tracking-tight", archivo.className)}>
              Organizational Blueprint
            </h2>
            <div className="h-px flex-1 mx-6 bg-border/60 group-hover:bg-primary/30 transition-colors duration-500" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Positions Defined</span>
          </div>
          
          <div className="bg-surface-low border border-border p-8 ring-1 ring-border shadow-sm">
            {positionsData.length > 0 && (
              <div className="mb-10">
                <PositionList positions={positionsData} electionId={electionId} />
              </div>
            )}
            <div className="pt-10 border-t border-border/60">
              <AddPositionForm electionId={electionId} />
            </div>
          </div>
        </section>

        {/* Candidate Audit */}
        <section>
          <div className="mb-8 flex items-baseline justify-between group">
            <h2 className={cn("text-2xl font-black uppercase tracking-tight", archivo.className)}>
              Candidate Audit
            </h2>
            <div className="h-px flex-1 mx-6 bg-border/60 group-hover:bg-primary/30 transition-colors duration-500" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Application Review</span>
          </div>

          <div className="bg-background border border-border ring-1 ring-border shadow-sm overflow-hidden">
            {candidatesData.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <Users className="size-12 text-muted-foreground/20" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Zero candidate records authenticated for this session.
                </p>
              </div>
            ) : (
              <InstitutionalDataTable 
                headers={["Candidate", "Position", "Organization", "Status", "Docs", "Actions"]}
                data={candidatesData.map(candidate => ({
                  "Candidate": (
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground uppercase tracking-tight">{candidate.full_name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{candidate.student_id}</p>
                    </div>
                  ),
                  "Position": <span className="text-xs font-black uppercase text-foreground/80">{candidate.positions?.title || "—"}</span>,
                  "Organization": (
                    <span className="text-xs font-medium">
                      {candidate.partylists ? `${candidate.partylists.acronym}` : <span className="text-muted-foreground italic">Independent</span>}
                    </span>
                  ),
                  "Status": getStatusBadge(candidate.application_status),
                  "Docs": (
                    <div className="flex gap-2">
                       {candidate.cog_link && (
                        <a href={candidate.cog_link} target="_blank" className="hover:text-primary transition-colors bg-surface-low border border-border rounded-none p-1.5" title="COG">
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                      {candidate.cor_link && (
                        <a href={candidate.cor_link} target="_blank" className="hover:text-primary transition-colors bg-surface-low border border-border rounded-none p-1.5" title="COR">
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  ),
                  "Actions": (
                    <CandidateActions
                      candidateId={candidate.candidate_id}
                      currentStatus={candidate.application_status}
                      electionId={electionId}
                    />
                  )
                }))}
              />
            )}
          </div>
        </section>

        {/* Election Results */}
        {votingStarted && (
          <section>
            <div className="mb-8 flex items-baseline justify-between group">
              <h2 className={cn("text-2xl font-black uppercase tracking-tight", archivo.className)}>
                Live Vote Tally
              </h2>
              <div className="h-px flex-1 mx-6 bg-border/60 group-hover:bg-primary/30 transition-colors duration-500" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Encrypted Tabulation</span>
            </div>
            <div className="bg-surface-low border border-border p-8 ring-1 ring-border shadow-sm">
              <ElectionResults electionId={electionId} />
            </div>
          </section>
        )}

        {/* Lower Ledger Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <section>
            <div className="mb-8 flex items-baseline justify-between group">
              <h2 className={cn("text-xl font-black uppercase tracking-tight", archivo.className)}>
                Voter Masterlist
              </h2>
              <div className="h-px flex-1 mx-4 bg-border/60 group-hover:bg-primary/30 transition-colors" />
            </div>
            <div className="bg-background border border-border p-8 ring-1 ring-border shadow-sm">
              <VoterMasterlist electionId={electionId} voters={votersData} />
            </div>
          </section>

          <section>
            <div className="mb-8 flex items-baseline justify-between group">
              <h2 className={cn("text-xl font-black uppercase tracking-tight", archivo.className)}>
                System Adjustments
              </h2>
              <div className="h-px flex-1 mx-4 bg-border/60 group-hover:bg-primary/30 transition-colors" />
            </div>
            <div className="bg-surface-low border border-border p-8 ring-1 ring-border shadow-sm">
              <TurnoutAdjustmentForm electionId={electionId} />
            </div>
          </section>
        </div>

        {/* Institutional Footer Seal */}
        <div className="pt-20 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">
             Certified Institutional Ledger // Plenum Environment
           </p>
           <p className="text-[10px] font-mono">
             HASH_VAL: {electionId.toUpperCase()}
           </p>
        </div>
      </div>
    </div>
  );
}

export default function ElectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 container max-w-6xl mx-auto px-6 pt-20">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="space-y-4">
            <div className="h-16 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-8 mt-12 text-center">
            <div className="h-24 bg-muted/50 rounded animate-pulse" />
            <div className="h-24 bg-muted/50 rounded animate-pulse" />
            <div className="h-24 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
      }
    >
      <ElectionDetailWrapper params={params} />
    </Suspense>
  );
}

async function ElectionDetailWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ElectionDetail electionId={id} />;
}
