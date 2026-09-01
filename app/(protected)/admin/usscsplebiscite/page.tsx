import { Suspense } from "react";
import { requireAdminOrChairperson } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UsscPlebisciteAdminManager } from "@/components/ussc-plebiscite-admin-manager";

async function UsscPlebisciteRoster() {
  await requireAdminOrChairperson();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("usscplebiscite2026")
    .select("*")
    .order("student_id");

  if (error) {
    throw new Error("Failed to load USSC plebiscite roster.");
  }

  return <UsscPlebisciteAdminManager entries={data ?? []} />;
}

export default function UsscPlebisciteAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">USSC Plebiscite 2026 Roster</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add or manage eligible student voters, ballot links, authorized emails, and change request forms for the USSC Plebiscite.
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">
            Loading plebiscite roster...
          </p>
        }
      >
        <UsscPlebisciteRoster />
      </Suspense>
    </div>
  );
}
