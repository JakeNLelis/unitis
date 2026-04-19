import { createClient } from "@/lib/supabase/server";
import { AcademicsManager } from "./academics-manager";
import { Suspense } from "react";
import type {
  AcademicCampusWithFaculties,
  AcademicDepartment,
  AcademicFaculty,
} from "@/lib/types/admin-academics";

async function AcademicsContent() {
  const supabase = await createClient();

  const { data: faculties } = await supabase
    .from("faculties")
    .select("faculty_id, campus_id, name, acronym")
    .order("name");

  const { data: departments } = await supabase
    .from("departments")
    .select("department_id, faculty_id, name, acronym")
    .order("name");

  const { data: courses } = await supabase
    .from("courses")
    .select("course_id, department_id, name, acronym")
    .order("name");

  const { data: campusesRaw } = await supabase
    .from("campuses")
    .select("campus_id, name, created_at")
    .order("name");

  // Nest: departments into faculties, courses into departments
  const deptMap = new Map<string, AcademicDepartment>();
  for (const d of departments || []) {
    deptMap.set(d.department_id, { ...d, courses: [] });
  }
  for (const c of courses || []) {
    deptMap.get(c.department_id)?.courses.push(c);
  }

  const facultyList: AcademicFaculty[] = (faculties || []).map((f) => ({
    ...f,
    departments: (departments || [])
      .filter((d) => d.faculty_id === f.faculty_id)
      .map((d) => deptMap.get(d.department_id)!),
  }));

  const campuses: AcademicCampusWithFaculties[] = (campusesRaw || []).map(
    (campus) => ({
      ...campus,
      faculties: facultyList.filter(
        (faculty) => faculty.campus_id === campus.campus_id,
      ),
    }),
  );

  return <AcademicsManager campuses={campuses} />;
}

export default function AcademicsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Academics Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage faculties, campuses, departments, and courses/programs.
        </p>
      </div>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading academics...</p>
        }
      >
        <AcademicsContent />
      </Suspense>
    </div>
  );
}
