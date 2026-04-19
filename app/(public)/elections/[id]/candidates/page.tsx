import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock3, Search } from "lucide-react";
import type {
  CandidatesContentProps,
  CandidatesElectionMeta,
  CandidatesPageProps,
  CandidatesPositionRow,
  CandidatesRaw,
  CandidatesRow,
} from "@/lib/types/public";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function formatDisplayDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDisplayTimeRange(startIso: string, endIso: string) {
  const start = new Date(startIso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const end = new Date(endIso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${start} - ${end}`;
}

async function CandidatesContent({
  electionId,
  query,
}: CandidatesContentProps) {
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select("election_id, name, election_type, start_date, end_date")
    .eq("election_id", electionId)
    .single();

  if (electionError || !election) {
    notFound();
  }

  const electionMeta = election as CandidatesElectionMeta;

  const { data: positions } = await supabase
    .from("positions")
    .select("position_id, title")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  const { data: candidates } = await adminSupabase
    .from("candidates")
    .select(
      "candidate_id, position_id, full_name, photo, partylists(name, acronym, platform)",
    )
    .eq("election_id", electionId)
    .eq("application_status", "approved")
    .order("full_name", { ascending: true });

  const candidatesNormalized: CandidatesRow[] = (
    (candidates || []) as CandidateRaw[]
  ).map((candidate) => {
    const party = Array.isArray(candidate.partylists)
      ? candidate.partylists[0] || null
      : candidate.partylists;

    return {
      candidate_id: candidate.candidate_id,
      position_id: candidate.position_id,
      full_name: candidate.full_name,
      photo: candidate.photo,
      partylists: party,
    };
  });

  const search = query.trim().toLowerCase();

  const filtered = candidatesNormalized.filter((candidate) => {
    if (!search) return true;
    const partyAcronym = candidate.partylists?.acronym?.toLowerCase() || "";
    const partyName = candidate.partylists?.name?.toLowerCase() || "";
    return (
      candidate.full_name.toLowerCase().includes(search) ||
      partyAcronym.includes(search) ||
      partyName.includes(search)
    );
  });

  const positionMap = new Map<string, CandidateRow[]>();
  for (const candidate of filtered) {
    const list = positionMap.get(candidate.position_id) || [];
    list.push(candidate);
    positionMap.set(candidate.position_id, list);
  }

  const hasAny = filtered.length > 0;

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-4 space-y-6">
        <div className="text-center space-y-2 pt-3">
          <h1 className="text-5xl font-extrabold leading-tight bg-linear-to-r from-primary via-blue-500 to-cyan-500 text-transparent bg-clip-text">
            {electionMeta.name}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              <span>{formatDisplayDate(electionMeta.start_date)}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Clock3 className="size-4" />
              <span>
                {formatDisplayTimeRange(
                  electionMeta.start_date,
                  electionMeta.end_date,
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-6">
          <h2 className="text-4xl font-black tracking-tight text-foreground">
            Candidate Directory
          </h2>
          <form method="GET" className="w-full max-w-sm">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Find Candidate by Name..."
                className="pl-9 h-10"
              />
            </div>
          </form>
        </div>

        {!hasAny ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground font-medium">
                No approved candidates found.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {((positions || []) as CandidatesPositionRow[]).map((position) => {
              const byPosition = positionMap.get(position.position_id) || [];
              if (byPosition.length === 0) return null;

              return (
                <section key={position.position_id} className="space-y-4">
                  <h3 className="text-4xl font-black tracking-tight">
                    {position.title}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {byPosition.map((candidate) => {
                      const platformPreview = candidate.partylists?.platform
                        ? `\"${candidate.partylists.platform.slice(0, 82)}${candidate.partylists.platform.length > 82 ? "..." : ""}\"`
                        : '"No platform statement provided."';

                      return (
                        <Card
                          key={candidate.candidate_id}
                          className="rounded-xl border border-border/80 shadow-sm"
                        >
                          <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                            {candidate.photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={candidate.photo}
                                alt={candidate.full_name}
                                className="size-24 rounded-full object-cover border-4 border-background shadow"
                              />
                            ) : (
                              <div className="size-24 rounded-full bg-muted border-4 border-background shadow flex items-center justify-center text-xl font-bold text-muted-foreground">
                                {getInitials(candidate.full_name)}
                              </div>
                            )}

                            <div className="space-y-1">
                              <p className="text-2xl font-black leading-tight">
                                {candidate.full_name}
                              </p>
                              <Badge className="rounded-full px-3 py-1 text-xs font-bold bg-blue-100 text-primary hover:bg-blue-100">
                                {candidate.partylists?.acronym || "INDEPENDENT"}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground leading-snug min-h-10">
                              {platformPreview}
                            </p>

                            <Button
                              asChild
                              className="w-full font-semibold"
                              size="sm"
                            >
                              <Link
                                href={`/elections/${electionId}/manage-partylist`}
                              >
                                View Platform
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function CandidatesPage({
  params,
  searchParams,
}: CandidatesPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container max-w-3xl mx-auto py-10 px-4 text-center">
            <p className="text-muted-foreground">Loading candidates...</p>
          </div>
        </div>
      }
    >
      <CandidatesPageWrapper params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CandidatesPageWrapper({
  params,
  searchParams,
}: CandidatesPageProps) {
  const { id } = await params;
  const { q } = await searchParams;
  return <CandidatesContent electionId={id} query={q || ""} />;
}
