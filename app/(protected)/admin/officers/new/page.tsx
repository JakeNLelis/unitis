import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { NewOfficerForm } from "@/app/(protected)/admin/officers/new/new-officer-form";
import type { FacultyOption } from "@/lib/types/admin-officers";

async function getOfficerFormOptions(): Promise<{
  facultyOptionsByCampus: Record<string, FacultyOption[]>;
  campuses: string[];
}> {
  const supabase = await createClient();

  const { data: faculties } = await supabase
    .from("faculties")
    .select("name, acronym, campuses(name)")
    .order("name");

  const { data: campuses } = await supabase
    .from("campuses")
    .select("name")
    .order("name");

  const facultyOptionsByCampus: Record<string, FacultyOption[]> = {};

  for (const faculty of faculties || []) {
    const rawCode = faculty.acronym?.trim();
    if (!rawCode) continue;

    const campusesRel = faculty.campuses as
      | { name: string }
      | { name: string }[]
      | null;
    const campusName = Array.isArray(campusesRel)
      ? campusesRel[0]?.name
      : campusesRel?.name;

    if (!campusName) continue;

    if (!facultyOptionsByCampus[campusName]) {
      facultyOptionsByCampus[campusName] = [];
    }

    const code = rawCode.toUpperCase();
    const options = facultyOptionsByCampus[campusName];
    if (!options.find((option) => option.code === code)) {
      options.push({
        code,
        label: `${code} — ${faculty.name}`,
      });
    }
  }

  for (const campusName of Object.keys(facultyOptionsByCampus)) {
    facultyOptionsByCampus[campusName].sort((a, b) =>
      a.code.localeCompare(b.code),
    );
  }

  return {
    facultyOptionsByCampus,
    campuses: (campuses || [])
      .map((campus) => campus.name)
      .filter((name): name is string => Boolean(name?.trim())),
  };
}

export default async function NewOfficerPage() {
  const { facultyOptionsByCampus, campuses } = await getOfficerFormOptions();

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link
          href="/admin/officers"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to SEB Officers
        </Link>
      </div>
      <NewOfficerForm
        facultyOptionsByCampus={facultyOptionsByCampus}
        campuses={campuses}
      />
    </div>
  );
}
