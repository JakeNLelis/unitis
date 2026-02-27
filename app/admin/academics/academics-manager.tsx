"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createFaculty,
  deleteFaculty,
  createDepartment,
  deleteDepartment,
  createCourse,
  deleteCourse,
} from "./actions";

interface Course {
  course_id: string;
  name: string;
  acronym: string | null;
  department_id: string;
}

interface Department {
  department_id: string;
  name: string;
  acronym: string | null;
  faculty_id: string;
  courses: Course[];
}

interface Faculty {
  faculty_id: string;
  name: string;
  acronym: string | null;
  departments: Department[];
}

export function AcademicsManager({ faculties }: { faculties: Faculty[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Faculty form
  const [facultyName, setFacultyName] = useState("");
  const [facultyAcronym, setFacultyAcronym] = useState("");

  // Department form
  const [deptFacultyId, setDeptFacultyId] = useState("");
  const [deptName, setDeptName] = useState("");
  const [deptAcronym, setDeptAcronym] = useState("");

  // Course form
  const [courseDeptId, setCourseDeptId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseAcronym, setCourseAcronym] = useState("");

  // Flatten departments for the course form
  const allDepartments = faculties.flatMap((f) =>
    f.departments.map((d) => ({
      ...d,
      facultyName: f.acronym || f.name,
    })),
  );

  async function handleAddFaculty(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("name", facultyName);
    fd.set("acronym", facultyAcronym);
    const result = await createFaculty(fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setFacultyName("");
      setFacultyAcronym("");
      router.refresh();
    }
  }

  async function handleAddDepartment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("faculty_id", deptFacultyId);
    fd.set("name", deptName);
    fd.set("acronym", deptAcronym);
    const result = await createDepartment(fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setDeptName("");
      setDeptAcronym("");
      router.refresh();
    }
  }

  async function handleAddCourse(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("department_id", courseDeptId);
    fd.set("name", courseName);
    fd.set("acronym", courseAcronym);
    const result = await createCourse(fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setCourseName("");
      setCourseAcronym("");
      router.refresh();
    }
  }

  async function handleDelete(
    type: "faculty" | "department" | "course",
    id: string,
    label: string,
  ) {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setError(null);
    setLoading(true);
    let result;
    if (type === "faculty") result = await deleteFaculty(id);
    else if (type === "department") result = await deleteDepartment(id);
    else result = await deleteCourse(id);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {/* Add Forms Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Add Faculty */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Faculty</CardTitle>
            <CardDescription className="text-xs">
              e.g. College of Engineering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFaculty} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="College of Engineering"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Acronym</Label>
                <Input
                  value={facultyAcronym}
                  onChange={(e) => setFacultyAcronym(e.target.value)}
                  placeholder="COE"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={loading}
              >
                Add Faculty
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Add Department */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Department</CardTitle>
            <CardDescription className="text-xs">
              Under a faculty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDepartment} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Faculty *</Label>
                <Select value={deptFacultyId} onValueChange={setDeptFacultyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((f) => (
                      <SelectItem key={f.faculty_id} value={f.faculty_id}>
                        {f.acronym ? `${f.acronym} — ${f.name}` : f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="Computer Science"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Acronym</Label>
                <Input
                  value={deptAcronym}
                  onChange={(e) => setDeptAcronym(e.target.value)}
                  placeholder="CS"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={loading}
              >
                Add Department
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Add Course */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Course / Program</CardTitle>
            <CardDescription className="text-xs">
              Under a department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCourse} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Department *</Label>
                <Select value={courseDeptId} onValueChange={setCourseDeptId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {allDepartments.map((d) => (
                      <SelectItem key={d.department_id} value={d.department_id}>
                        {d.facultyName} → {d.acronym || d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="BS Computer Science"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Acronym</Label>
                <Input
                  value={courseAcronym}
                  onChange={(e) => setCourseAcronym(e.target.value)}
                  placeholder="BSCS"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={loading}
              >
                Add Course
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Existing Data */}
      {faculties.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground text-sm">
            No faculties yet. Add one above to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {faculties.map((faculty) => (
            <Card key={faculty.faculty_id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {faculty.acronym && (
                      <span className="text-primary font-bold">
                        {faculty.acronym}{" "}
                      </span>
                    )}
                    {faculty.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive text-xs"
                    onClick={() =>
                      handleDelete("faculty", faculty.faculty_id, faculty.name)
                    }
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {faculty.departments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No departments yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {faculty.departments.map((dept) => (
                      <div
                        key={dept.department_id}
                        className="border rounded-md p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold">
                            {dept.acronym && (
                              <span className="text-primary">
                                {dept.acronym}{" "}
                              </span>
                            )}
                            {dept.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive text-xs h-7"
                            onClick={() =>
                              handleDelete(
                                "department",
                                dept.department_id,
                                dept.name,
                              )
                            }
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </div>
                        {dept.courses.length === 0 ? (
                          <p className="text-xs text-muted-foreground ml-2">
                            No courses yet.
                          </p>
                        ) : (
                          <div className="ml-2 space-y-1">
                            {dept.courses.map((course) => (
                              <div
                                key={course.course_id}
                                className="flex items-center justify-between bg-muted/50 rounded px-3 py-1.5"
                              >
                                <span className="text-sm">
                                  {course.acronym && (
                                    <span className="font-medium text-primary">
                                      {course.acronym} —{" "}
                                    </span>
                                  )}
                                  {course.name}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive text-xs h-6 px-2"
                                  onClick={() =>
                                    handleDelete(
                                      "course",
                                      course.course_id,
                                      course.name,
                                    )
                                  }
                                  disabled={loading}
                                >
                                  ✕
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
