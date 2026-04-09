import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getElectionState } from "@/lib/utils";
import { EventActionPanel } from "@/components/event-action-panel";
import type { ElectionState } from "@/lib/types/election";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Flag, Info } from "lucide-react";

interface ElectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function ElectionPage({ params }: ElectionPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch election details
  const { data: election, error } = await supabase
    .from("elections")
    .select("*")
    .eq("election_id", id)
    .single();

  if (error || !election) {
    notFound();
  }

  const state = getElectionState(
    election.start_date,
    election.end_date,
  ) as ElectionState;

  if (state === "ended") {
    redirect(`/archive/${id}`);
  }

  const stateLabel = state === "active" ? "Happening now" : "Upcoming election";
  const stateVariant = state === "active" ? "default" : "secondary";

  return (
    <main className="container max-w-4xl mx-auto px-4 py-10">
      <div className="space-y-6">
        <div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to elections
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge variant={stateVariant}>{stateLabel}</Badge>
                <CardTitle className="text-2xl font-bold">
                  {election.name}
                </CardTitle>
                <CardDescription>{election.election_type}</CardDescription>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  Voting schedule
                </p>
                <p className="mt-1 text-sm font-medium">
                  {new Date(election.start_date).toLocaleDateString()} -{" "}
                  {new Date(election.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Flag className="size-3.5" />
                  Election type
                </p>
                <p className="mt-1 text-sm font-medium">
                  {election.election_type}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Info className="size-4" />
              Choose an action below to proceed with this election.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Available actions</h2>
          <p className="text-sm text-muted-foreground">
            Actions shown here depend on the election state.
          </p>
        </div>

        <EventActionPanel
          electionId={id}
          electionName={election.name}
          state={state}
        />
      </div>
    </main>
  );
}
