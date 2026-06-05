import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile, getSEBOfficer } from "@/lib/auth";
import { Election, Position, CandidateWithDetails } from "@/lib/types/election";
import { getDateTimeWindowStatus, isDateTimeWindowOpen, cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import Link from "next/link";
import { ExternalLink, Users, BarChart3 } from "lucide-react";
import { AddPositionForm } from "./add-position-form";
import { CandidateActions } from "./candidate-actions";
import { CopyableUrl } from "./copyable-url";
import { PositionList } from "./position-list";
import { EditElectionDates } from "./edit-election-dates";
import { DeleteElectionButton } from "./delete-election-button";
import { ElectionResults } from "./election-results";
import { VoterMasterlist } from "./voter-masterlist";
import { CandidateDetailDialog } from "./candidate-detail-dialog";
import { TurnoutAdjustmentForm } from "./turnout-adjustment-form";
import { PartylistRequiredSettings } from "./partylist-required-settings";
import { archivo } from "@/lib/fonts";
import { InstitutionalDataTable } from "@/components/institutional/data-table";
import { InstitutionalListItem } from "@/components/institutional/list-item";
import { Badge } from "@/components/ui/badge";
import { getElectionPermissionsForActor } from "@/lib/election-permissions";
import { BackToRegistryLink } from "./back-to-registry-link";
import {
  getStatusBadge,
  isElectionManagerRole,
} from "@/app/_helpers/elections/officer-page";

type ElectionPermissions = ReturnType<typeof getElectionPermissionsForActor>;
type VoterListRow = {
  voter_id: string;
  student_id: string;
  is_voted: boolean;
  faculty_id: string | null;
  course_id: string | null;
  faculties: { acronym: string | null } | null;
  courses: { acronym: string | null } | null;
};

function HeroHeaderSection({
  electionId,
  electionData,
  permissions,
  candidacyOpen,
}: {
  electionId: string;
  electionData: Election;
  permissions: ElectionPermissions;
  candidacyOpen: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-2 border-foreground pb-12">
      <div className="max-w-2xl space-y-6">
        <div>
          {candidacyOpen && (
            <span className="inline-block px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest mb-4">
              Accepting Candidates
            </span>
          )}
          <h1
            className={cn(
              "text-6xl font-black tracking-tighter uppercase leading-[0.85]",
              archivo.className,
            )}
          >
            {electionData.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
            Category:
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-foreground">
            {electionData.election_type}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DeleteElectionButton
          electionId={electionId}
          electionName={electionData.name}
          canDelete={permissions.canDelete}
        />
      </div>
    </div>
  );
}

function TemporalControlsSection({
  electionId,
  electionData,
  permissions,
  candidacyOpen,
  baseUrl,
}: {
  electionId: string;
  electionData: Election;
  permissions: ElectionPermissions;
  candidacyOpen: boolean;
  baseUrl: string;
}) {
  const applicationUrl = `/elections/${electionId}/apply`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8 space-y-12">
        <section>
          <div className="mb-6">
            <h2
              className={cn(
                "text-xl font-black uppercase tracking-tight",
                archivo.className,
              )}
            >
              Phase Schedule
            </h2>
          </div>
          <div className="bg-surface-low border-y border-border px-8 py-6">
            <EditElectionDates
              electionId={electionId}
              candidacyStartDate={electionData.candidacy_start_date}
              candidacyEndDate={electionData.candidacy_end_date}
              startDate={electionData.start_date}
              endDate={electionData.end_date}
              canEdit={permissions.canEdit}
            />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2
              className={cn(
                "text-xl font-black uppercase tracking-tight",
                archivo.className,
              )}
            >
              System Access Points
            </h2>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Public Links
            </span>
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
        <h3
          className={cn(
            "text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6",
            archivo.className,
          )}
        >
          Quick Reports
        </h3>
        <ul className="space-y-4">
          <li>
            <Link
              href={`/elections/${electionId}/turnout`}
              className="flex items-center justify-between group"
            >
              <span className="text-xs font-bold uppercase tracking-wide text-foreground group-hover:text-primary underline decoration-border group-hover:decoration-primary transition-all">
                Live Turnout Ledger
              </span>
              <BarChart3 className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

function PositionsSection({
  electionId,
  positionsData,
  permissions,
}: {
  electionId: string;
  positionsData: Position[];
  permissions: ElectionPermissions;
}) {
  return (
    <section>
      <div className="mb-8 flex items-baseline justify-between group">
        <h2
          className={cn(
            "text-2xl font-black uppercase tracking-tight",
            archivo.className,
          )}
        >
          Organizational Blueprint
        </h2>
        <div className="h-px flex-1 mx-6 bg-border/60 group-hover:bg-primary/30 transition-colors duration-500" />
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          Positions Defined
        </span>
      </div>

      <div className="bg-surface-low border border-border p-8 ring-1 ring-border shadow-sm">
        {positionsData.length > 0 && (
          <div className="mb-10">
            <PositionList
              positions={positionsData}
              electionId={electionId}
              canEdit={permissions.canEdit}
            />
          </div>
        )}
        <div className="pt-10 border-t border-border/60">
          <AddPositionForm
            electionId={electionId}
            canEdit={permissions.canEdit}
          />
        </div>
      </div>
    </section>
  );
}

function PartylistSettingsSection({
  electionId,
  positionsData,
  permissions,
}: {
  electionId: string;
  positionsData: Position[];
  permissions: ElectionPermissions;
}) {
  return (
    <section>
      <div className="mb-8 flex items-baseline justify-between group">
        <h2
          className={cn(
            "text-2xl font-black uppercase tracking-tight",
            archivo.className,
          )}
        >
          Partylist Requirements
        </h2>
        <div className="h-px flex-1 mx-6 bg-border/60 group-hover:bg-primary/30 transition-colors duration-500" />
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          Registration Gate
        </span>
      </div>

      <div className="bg-surface-low border border-border p-8 ring-1 ring-border shadow-sm">
        <PartylistRequiredSettings
          electionId={electionId}
          positions={positionsData}
          canEdit={permissions.canEdit}
        />
      </div>
    </section>
  );
}

function CandidateAuditSection({
  electionId,
  candidatesData,
  permissions,
}: {
  electionId: string;
  candidatesData: CandidateWithDetails[];
  permissions: ElectionPermissions;
}) {
  return (
    <section>
      <div className="mb-8 flex items-baseline justify-between group">
        <h2
          className={cn(
            "text-2xl font-black uppercase tracking-tight",
            archivo.className,
          )}
        >
          Candidate Audit
        </h2>
        <div className="h-px flex-1 mx-6 bg-border/60 group-hover:bg-primary/30 transition-colors duration-500" />
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          Application Review
        </span>
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
            headers={[
              "Candidate",
              "Position",
              "Organization",
              "Status",
              "Approved By",
              "Approved At",
              "Docs",
              "Actions",
            ]}
            data={candidatesData.map((candidate) => ({
              Candidate: (
                <CandidateDetailDialog candidate={candidate}>
                  <button className="space-y-0.5 text-left hover:underline hover:text-primary transition-all cursor-pointer">
                    <p className="font-bold text-foreground uppercase tracking-tight">
                      {candidate.full_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                      {candidate.student_id}
                    </p>
                  </button>
                </CandidateDetailDialog>
              ),
              Position: (
                <span className="text-xs font-black uppercase text-foreground/80">
                  {candidate.positions?.title || "—"}
                </span>
              ),
              Organization: (
                <span className="text-xs font-medium">
                  {candidate.partylists ? (
                    `${candidate.partylists.acronym}`
                  ) : (
                    <span className="text-muted-foreground italic">
                      Independent
                    </span>
                  )}
                </span>
              ),
              Status: getStatusBadge(candidate.application_status),
              "Approved By": candidate.approved_by_display || (
                <span className="text-muted-foreground">—</span>
              ),
              "Approved At": candidate.approved_at ? (
                new Date(candidate.approved_at).toLocaleString()
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
              Docs: (
                <div className="flex gap-2">
                  {candidate.cog_link && (
                    <a
                      href={candidate.cog_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors bg-surface-low border border-border rounded-none p-1.5"
                      title="COG"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                  {candidate.cor_link && (
                    <a
                      href={candidate.cor_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors bg-surface-low border border-border rounded-none p-1.5"
                      title="COR"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                  {candidate.good_moral_link && (
                    <a
                      href={candidate.good_moral_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors bg-surface-low border border-border rounded-none p-1.5"
                      title="Good Moral Character"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              ),
              Actions: (
                <CandidateActions
                  candidateId={candidate.candidate_id}
                  currentStatus={candidate.application_status}
                  canApprove={permissions.canApprove}
                  electionId={electionId}
                />
              ),
            }))}
          />
        )}
      </div>
    </section>
  );
}

function ResultsSection({ electionId }: { electionId: string }) {
  return (
    <section>
      <div className="mb-8 flex items-baseline justify-between group">
        <h2
          className={cn(
            "text-2xl font-black uppercase tracking-tight",
            archivo.className,
          )}
        >
          Live Vote Tally
        </h2>
        <div className="h-px flex-1 mx-6 bg-border/60 group-hover:bg-primary/30 transition-colors duration-500" />
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          Encrypted Tabulation
        </span>
      </div>
      <div className="bg-surface-low border border-border p-8 ring-1 ring-border shadow-sm">
        <ElectionResults electionId={electionId} />
      </div>
    </section>
  );
}

function LowerLedgerSections({
  electionId,
  votersData,
  permissions,
  votingStatus,
  faculties,
  courses,
  electionType,
}: {
  electionId: string;
  votersData: VoterListRow[];
  permissions: ElectionPermissions;
  votingStatus: string;
  faculties: { faculty_id: string; name: string; acronym: string | null }[];
  courses: { course_id: string; name: string; acronym: string | null; faculty_id: string | null }[];
  electionType: string;
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
      <section>
        <div className="mb-8 flex items-baseline justify-between group">
          <h2
            className={cn(
              "text-xl font-black uppercase tracking-tight",
              archivo.className,
            )}
          >
            Voter Masterlist
          </h2>
          <div className="h-px flex-1 mx-4 bg-border/60 group-hover:bg-primary/30 transition-colors" />
        </div>
        <div className="bg-background border border-border p-8 ring-1 ring-border shadow-sm">
          <VoterMasterlist
            electionId={electionId}
            voters={votersData}
            canEdit={
              permissions.canEdit &&
              votingStatus !== "open" &&
              votingStatus !== "ended"
            }
            faculties={faculties}
            courses={courses}
            electionType={electionType}
          />
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-baseline justify-between group">
          <h2
            className={cn(
              "text-xl font-black uppercase tracking-tight",
              archivo.className,
            )}
          >
            System Adjustments
          </h2>
          <div className="h-px flex-1 mx-4 bg-border/60 group-hover:bg-primary/30 transition-colors" />
        </div>
        <div className="bg-surface-low border border-border p-8 ring-1 ring-border shadow-sm">
          <TurnoutAdjustmentForm
            electionId={electionId}
            canEdit={permissions.canEdit}
          />
        </div>
      </section>
    </div>
  );
}

async function ElectionDetail({ electionId }: { electionId: string }) {
  const profile = await getCurrentProfile();
  if (!isElectionManagerRole(profile?.role)) {
    return null;
  }

  const officer = profile.role === "seb-officer" ? await getSEBOfficer() : null;
  if (profile.role === "seb-officer" && !officer) {
    return null;
  }

  const adminSupabase = await createAdminClient();

  const { data: election, error: electionError } = await adminSupabase
    .from("elections")
    .select("*")
    .eq("election_id", electionId)
    .single();

  if (electionError || !election) {
    notFound();
  }

  const [
    positionsRes,
    candidatesRes,
    votersRes,
    facultiesRes,
    coursesRes,
    auditLogsRes
  ] = await Promise.all([
    adminSupabase
      .from("positions")
      .select("*")
      .eq("election_id", electionId)
      .order("created_at", { ascending: true }),
    adminSupabase
      .from("candidates")
      .select("*, positions(title), courses(name, acronym), partylists(name, acronym)")
      .eq("election_id", electionId)
      .order("created_at", { ascending: false }),
    adminSupabase
      .from("voters")
      .select("voter_id, student_id, is_voted, faculty_id, course_id, faculties(acronym), courses(acronym)")
      .eq("election_id", electionId)
      .order("created_at", { ascending: true }),
    adminSupabase
      .from("faculties")
      .select("faculty_id, name, acronym")
      .order("name", { ascending: true }),
    adminSupabase
      .from("courses")
      .select("course_id, name, acronym, department_id, departments(faculty_id)")
      .order("name", { ascending: true }),
    adminSupabase
      .from("admin_logs")
      .select("log_id, created_at, actor_email, actor_role, action_type, description")
      .eq("election_id", electionId)
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  if (
    positionsRes.error ||
    candidatesRes.error ||
    votersRes.error ||
    facultiesRes.error ||
    coursesRes.error ||
    auditLogsRes.error
  ) {
    throw new Error("Failed to load comprehensive election data. Please try again later.");
  }

  const positions = positionsRes.data;
  const candidates = candidatesRes.data;
  const voters = votersRes.data;
  const faculties = facultiesRes.data;
  const coursesData = coursesRes.data;
  const auditLogs = auditLogsRes.data;

  const coursesList = (coursesData || []).map((c) => {
    const dept = Array.isArray(c.departments)
      ? c.departments[0]
      : c.departments;
    return {
      course_id: c.course_id,
      name: c.name,
      acronym: c.acronym,
      faculty_id: dept?.faculty_id || null,
    };
  });

  const electionData = election as Election;
  const positionsData = (positions || []) as Position[];
  const candidatesData = (candidates || []) as CandidateWithDetails[];
  const votersData = ((voters || []).map((v: unknown) => {
    const raw = v as Record<string, unknown>;
    return {
      ...raw,
      faculties: Array.isArray(raw.faculties) ? raw.faculties[0] || null : raw.faculties,
      courses: Array.isArray(raw.courses) ? raw.courses[0] || null : raw.courses,
    };
  })) as VoterListRow[];

  const permissions = getElectionPermissionsForActor(
    {
      election_type: electionData.election_type,
      created_by: electionData.created_by,
      owner_campus: electionData.owner_campus,
      owner_faculty_code: electionData.owner_faculty_code,
      access_policy_locked: electionData.access_policy_locked,
    },
    {
      role: profile.role,
      officer: officer
        ? {
            seb_officer_id: officer.seb_officer_id,
            campus: officer.campus,
            faculty_code: officer.faculty_code,
          }
        : null,
    },
  );

  if (!permissions.canView) {
    notFound();
  }

  const candidacyOpen = isDateTimeWindowOpen(
    electionData.candidacy_start_date,
    electionData.candidacy_end_date,
  );
  const votingStatus = getDateTimeWindowStatus(
    electionData.start_date,
    electionData.end_date,
  );
  const votingEnded = votingStatus === "ended";

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = `${proto}://${host}`;

  const auditLogData = (auditLogs || []).map((log) => ({
    Date: new Date(log.created_at).toLocaleString(),
    Actor: log.actor_email,
    Role: (
      <Badge variant="outline" className="text-[10px]">
        {log.actor_role}
      </Badge>
    ),
    Action: (
      <Badge variant="secondary" className="text-[10px] font-mono">
        {log.action_type}
      </Badge>
    ),
    Description: log.description,
  }));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-6xl mx-auto px-6 space-y-12">
        <div className="pt-8 group">
          <BackToRegistryLink />
        </div>

        <HeroHeaderSection
          electionId={electionId}
          electionData={electionData}
          permissions={permissions}
          candidacyOpen={candidacyOpen}
        />

        <TemporalControlsSection
          electionId={electionId}
          electionData={electionData}
          permissions={permissions}
          candidacyOpen={candidacyOpen}
          baseUrl={baseUrl}
        />

        <PositionsSection
          electionId={electionId}
          positionsData={positionsData}
          permissions={permissions}
        />

        <PartylistSettingsSection
          electionId={electionId}
          positionsData={positionsData}
          permissions={permissions}
        />

        <CandidateAuditSection
          electionId={electionId}
          candidatesData={candidatesData}
          permissions={permissions}
        />

        {votingEnded && <ResultsSection electionId={electionId} />}

        <LowerLedgerSections
          electionId={electionId}
          votersData={votersData}
          permissions={permissions}
          votingStatus={votingStatus}
          faculties={faculties || []}
          courses={coursesList}
          electionType={electionData.election_type}
        />

        <section>
          <div className="mb-8 flex items-baseline justify-between group">
            <h2
              className={cn(
                "text-xl font-black uppercase tracking-tight",
                archivo.className,
              )}
            >
              Election Audit Logs
            </h2>
            <div className="h-px flex-1 mx-4 bg-border/60 group-hover:bg-primary/30 transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Latest activity
            </span>
          </div>
          <InstitutionalDataTable
            headers={["Date", "Actor", "Role", "Action", "Description"]}
            data={
              auditLogData.length > 0
                ? auditLogData
                : [
                    {
                      Date: "",
                      Actor: "",
                      Role: "",
                      Action: "",
                      Description: "No audit log entries found for this election yet.",
                    },
                  ]
            }
          />
        </section>
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
