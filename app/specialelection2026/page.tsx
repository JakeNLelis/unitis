import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SpecialElectionAccess } from "@/components/special-election-access";

async function getFacultyOptions() {
  const supabase = await createClient();

  for (const column of ["faculty", "faculty_assigned"]) {
    const { data, error } = await supabase
      .from("specialelection2026")
      .select(column)
      .not(column, "is", null);

    if (!error && data) {
      const uniqueFaculties = Array.from(
        new Set(
          data
            .map((row) => String((row as Record<string, unknown>)[column] ?? "").trim())
            .filter(Boolean),
        ),
      )
        .map((faculty) => faculty.toUpperCase())
        .sort();

      if (uniqueFaculties.length > 0) {
        return uniqueFaculties.map((faculty) => ({
          value: faculty,
          label: faculty,
        }));
      }
    }
  }

  const { data, error } = await supabase
    .from("faculties")
    .select("acronym, name")
    .order("name");

  if (error || !data) {
    return [] as { value: string; label: string }[];
  }

  return data
    .filter((faculty) => faculty.acronym)
    .map((faculty) => ({
      value: faculty.acronym,
      label: `${faculty.name} (${faculty.acronym})`,
    }));
}

export default async function SpecialElection2026Page() {
  const faculties = await getFacultyOptions();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>

        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            University Election Special Access
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Special Election 2026</h1>
        </div>

        <SpecialElectionAccess faculties={faculties} />
      </div>
    </div>
  );
}
