import { Suspense } from "react";
import { requireAdminOrChairperson } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SpecialElectionAdminManager } from "@/components/special-election-admin-manager";

async function SpecialElectionRoster() {
  await requireAdminOrChairperson();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("specialelection2026")
    .select("*")
    .order("student_id");

  if (error) {
    throw new Error("Failed to load special election roster.");
  }

  return <SpecialElectionAdminManager entries={data ?? []} />;
}

export default function SpecialElectionAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Special Election 2026 Roster</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add or manage eligible student voters for the special election.
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading roster...</p>}>
        <SpecialElectionRoster />
      </Suspense>
    </div>
  );
}
