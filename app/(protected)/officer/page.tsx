import { createAdminClient } from "@/lib/supabase/admin";
import { requireElectionManager } from "@/lib/auth";
import { InstitutionalListItem } from "@/components/institutional/list-item";
import { ArrowRight, PlusCircle, ClipboardList, Activity } from "lucide-react";
import Link from "next/link";

export default async function OfficerDashboardPage() {
  const { profile } = await requireElectionManager();
  const supabase = await createAdminClient();

  // Fetch aggregate stats for the ledger overview
  const [{ count: totalElections }, { count: pendingCandidates }] =
    await Promise.all([
      supabase.from("elections").select("*", { count: "exact", head: true }),
      supabase
        .from("candidates")
        .select("*", { count: "exact", head: true })
        .eq("application_status", "pending"),
      supabase.from("voters").select("*", { count: "exact", head: true }),
    ]);

  // Fetch recent candidate applications for the audit log
  const { data: recentApplications } = await supabase
    .from("candidates")
    .select(
      "candidate_id, full_name, created_at, application_status, elections(name)",
    )
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tighter uppercase leading-[0.8] mb-2">
              System
              <br />
              Overview
            </h1>
            <p className="text-xl font-medium max-w-xl border-l-4 border-primary pl-4 py-2 bg-surface-low">
              Welcome back,{" "}
              <span className="font-bold text-primary">
                {profile.display_name}
              </span>
              . The registry is active and synchronized.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/officer/elections/new"
              className="flex items-center justify-between px-6 py-4 bg-foreground text-background font-bold uppercase tracking-tight hover:bg-primary transition-colors group"
            >
              <span>Initialize New Election</span>
              <PlusCircle className="size-5 group-hover:rotate-90 transition-transform ml-4" />
            </Link>
            <Link
              href="/officer/elections"
              className="flex items-center justify-between px-6 py-4 border-2 border-foreground font-bold uppercase tracking-tight hover:bg-surface-low transition-colors group"
            >
              <span>View Election Registry</span>
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform ml-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Synchronized Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border-b border-border">
        <div className="p-8 bg-background hover:bg-surface-low transition-colors">
          <div className="flex items-center justify-between mb-4">
            <ClipboardList className="size-6" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Registry
            </span>
          </div>
          <div className="text-5xl font-black font-heading mb-1">
            {totalElections}
          </div>
          <p className="text-sm font-bold uppercase tracking-tight text-muted-foreground">
            Total Elections
          </p>
        </div>

        <div className="p-8 bg-background hover:bg-surface-low transition-colors">
          <div className="flex items-center justify-between mb-4">
            <Activity className="size-6 text-destructive" />
            <span className="text-xs font-black uppercase tracking-widest text-destructive">
              Urgent
            </span>
          </div>
          <div className="text-5xl font-black font-heading mb-1">
            {pendingCandidates}
          </div>
          <p className="text-sm font-bold uppercase tracking-tight text-muted-foreground">
            Pending Applications
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black font-heading uppercase tracking-tighter">
            Application Audit Trail
          </h2>
          <Link
            href="/officer/elections"
            className="text-sm font-bold underline hover:text-primary"
          >
            Full Registry {">"}
          </Link>
        </div>

        <div className="border-2 border-foreground overflow-hidden">
          <div className="divide-y-2 divide-foreground">
            {recentApplications?.map((app) => {
              const election = app.elections as unknown as
                | { name: string }
                | { name: string }[]
                | null;

              const electionName = Array.isArray(election)
                ? election[0]?.name
                : election?.name;

              return (
                <div
                  key={app.candidate_id}
                  className="group hover:bg-surface-low transition-colors"
                >
                  <InstitutionalListItem
                    title={app.full_name}
                    subtitle={electionName || "Unknown Election"}
                    status={app.application_status}
                    timestamp={new Date(app.created_at).toLocaleDateString()}
                    action={
                      <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                    }
                    href={`/officer/elections`}
                  />
                </div>
              );
            })}
            {(!recentApplications || recentApplications.length === 0) && (
              <div className="p-12 text-center bg-surface-low">
                <p className="font-bold text-muted-foreground uppercase">
                  No recent activity detected in the audit log.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 border-2 border-foreground bg-surface-low group hover:bg-primary transition-all cursor-pointer">
          <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-white mb-2">
            Voter Registry
          </h3>
          <p className="text-sm text-muted-foreground group-hover:text-white/80 mb-6">
            Manage the global list of eligible student voters across all
            faculties.
          </p>
          <div className="flex items-center text-sm font-black uppercase group-hover:text-white">
            Access Database <ArrowRight className="size-4 ml-2" />
          </div>
        </div>

        <div className="p-8 border-2 border-foreground bg-surface-low group hover:bg-foreground transition-all cursor-pointer">
          <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-white mb-2">
            System Reports
          </h3>
          <p className="text-sm text-muted-foreground group-hover:text-white/80 mb-6">
            Generate official election certificates and turnout documentation.
          </p>
          <div className="flex items-center text-sm font-black uppercase group-hover:text-white">
            Generate Exports <ArrowRight className="size-4 ml-2" />
          </div>
        </div>
      </section>
    </div>
  );
}
