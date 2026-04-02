import { createClient } from "@/lib/supabase/server";
import { getElectionState, getTodayStr } from "@/lib/utils";
import { Election } from "@/lib/types/election";
import { HappeningNowSection } from "@/components/happening-now-section";
import { UpcomingElectionSection } from "@/components/upcoming-election-section";
import { Card, CardContent } from "@/components/ui/card";
import { Vote } from "lucide-react";

/**
 * T016: Server-side election partition query and mapping
 *
 * Queries all non-archived elections, partitions them into:
 * - Happening Now (active elections)
 * - Upcoming (future elections)
 *
 * Renders split sections for landing page (US1 - MVP)
 */
export async function ElectionsList() {
  const supabase = await createClient();
  const today = getTodayStr();

  // Query all non-archived elections
  const { data: elections, error } = await supabase
    .from("elections")
    .select(
      "election_id, name, election_type, start_date, end_date, is_archived",
    )
    .eq("is_archived", false)
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Error fetching elections:", error);
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Error loading elections</p>
        </CardContent>
      </Card>
    );
  }

  const allElections = (elections as Election[]) || [];

  // Partition elections into active (happening now) and upcoming
  const activeElections = allElections.filter((election) => {
    const state = getElectionState(
      election.start_date,
      election.end_date,
      today,
    );
    return state === "active";
  });

  const upcomingElections = allElections.filter((election) => {
    const state = getElectionState(
      election.start_date,
      election.end_date,
      today,
    );
    return state === "upcoming";
  });

  // If no elections at all, show empty state
  if (activeElections.length === 0 && upcomingElections.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-3 size-10 rounded-full bg-muted flex items-center justify-center">
            <Vote className="size-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">
            No elections scheduled
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later for upcoming elections.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <HappeningNowSection elections={activeElections} />
      <UpcomingElectionSection elections={upcomingElections} />
    </div>
  );
}
