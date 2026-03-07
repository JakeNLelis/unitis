import { createClient } from "@/lib/supabase/server";
import { AcademicsManager } from "./academics-manager";
import { Suspense } from "react";

interface Faculty {
  faculty_id: string;
  name: string;
  acronym: string | null;
  departments: Department[];
}

interface Department {
  department_id: string;
  name: string;
  acronym: string | null;
  faculty_id: string;
  courses: Course[];
}

interface Course {
  course_id: string;
  name: string;
  acronym: string | null;
  department_id: string;
}

async function AcademicsContent() {
  const supabase = await createClient();

  const { data: faculties } = await supabase
    .from("faculties")
    .select("faculty_id, name, acronym")
    .order("name");

  const { data: departments } = await supabase
    .from("departments")
    .select("department_id, faculty_id, name, acronym")
    .order("name");

  const { data: courses } = await supabase
    .from("courses")
    .select("course_id, department_id, name, acronym")
    .order("name");

  // Nest: departments into faculties, courses into departments
  const deptMap = new Map<string, Department>();
  for (const d of departments || []) {
    deptMap.set(d.department_id, { ...d, courses: [] });
  }
  for (const c of courses || []) {
    deptMap.get(c.department_id)?.courses.push(c);
  }

  const facultyList: Faculty[] = (faculties || []).map((f) => ({
    ...f,
    departments: (departments || [])
      .filter((d) => d.faculty_id === f.faculty_id)
      .map((d) => deptMap.get(d.department_id)!),
  }));

  return <AcademicsManager faculties={facultyList} />;
}

export default function AcademicsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Academics Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage faculties, departments, and courses/programs. These appear as
          choices in the candidacy application form.
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
