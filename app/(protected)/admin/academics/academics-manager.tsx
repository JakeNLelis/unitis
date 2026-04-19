"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Trash2, X } from "lucide-react";
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
  createCampus,
  deleteCampus,
  updateCampusName,
  createFaculty,
  deleteFaculty,
  updateFacultyName,
  createDepartment,
  deleteDepartment,
  updateDepartmentName,
  createCourse,
  deleteCourse,
  updateCourseName,
} from "./actions";
import type {
  EditableEntityType,
  EditState,
  AcademicCampusWithFaculties,
} from "@/lib/types/admin-academics";

export function AcademicsManager({
  campuses,
}: {
  campuses: AcademicCampusWithFaculties[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<EditState | null>(null);

  const faculties = campuses.flatMap((campus) => campus.faculties);

  // Faculty form
  const [facultyCampusId, setFacultyCampusId] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [facultyAcronym, setFacultyAcronym] = useState("");

  // Campus form
  const [campusName, setCampusName] = useState("");

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
    f.departments.map((department) => ({
      ...department,
      campusName:
        campuses.find((campus) => campus.campus_id === f.campus_id)?.name ||
        "Unknown campus",
      facultyName: f.acronym || f.name,
    })),
  );

  const allFaculties = faculties.map((faculty) => ({
    ...faculty,
    campusName:
      campuses.find((campus) => campus.campus_id === faculty.campus_id)?.name ||
      "Unknown campus",
  }));

  async function handleAddFaculty(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("campus_id", facultyCampusId);
    fd.set("name", facultyName);
    fd.set("acronym", facultyAcronym);
    const result = await createFaculty(fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setFacultyCampusId("");
      setFacultyName("");
      setFacultyAcronym("");
      router.refresh();
    }
  }

  async function handleAddCampus(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("name", campusName);
    const result = await createCampus(fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setCampusName("");
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
    type: "faculty" | "department" | "course" | "campus",
    id: string,
    label: string,
  ) {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setError(null);
    setLoading(true);
    let result;
    if (type === "faculty") result = await deleteFaculty(id);
    else if (type === "department") result = await deleteDepartment(id);
    else if (type === "course") result = await deleteCourse(id);
    else result = await deleteCampus(id);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  function startEdit(
    type: EditableEntityType,
    id: string,
    name: string,
    acronym?: string | null,
  ) {
    setError(null);
    setEditing({ type, id, name, acronym: acronym || "" });
  }

  function updateEditingName(name: string) {
    setEditing((current) => (current ? { ...current, name } : current));
  }

  function updateEditingAcronym(acronym: string) {
    setEditing((current) => (current ? { ...current, acronym } : current));
  }

  async function handleSaveEdit() {
    if (!editing) return;

    const nextName = editing.name.trim();
    const nextAcronym = editing.acronym?.trim() || null;
    if (!nextName) {
      setError("Name is required.");
      return;
    }

    setError(null);
    setLoading(true);

    let result;
    if (editing.type === "campus") {
      result = await updateCampusName(editing.id, nextName);
    } else if (editing.type === "faculty") {
      result = await updateFacultyName(editing.id, nextName, nextAcronym);
    } else if (editing.type === "department") {
      result = await updateDepartmentName(editing.id, nextName, nextAcronym);
    } else {
      result = await updateCourseName(editing.id, nextName, nextAcronym);
    }

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    setEditing(null);
    router.refresh();
  }

  function handleCancelEdit() {
    setEditing(null);
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {/* Add Forms Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Add Faculty */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Faculty</CardTitle>
            <CardDescription className="text-xs">
              Under a campus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFaculty} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Campus *</Label>
                <Select
                  value={facultyCampusId}
                  onValueChange={setFacultyCampusId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map((campus) => (
                      <SelectItem
                        key={campus.campus_id}
                        value={campus.campus_id}
                      >
                        {campus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

        {/* Add Campus */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Campus</CardTitle>
            <CardDescription className="text-xs">
              e.g. Main Campus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCampus} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Campus name *</Label>
                <Input
                  value={campusName}
                  onChange={(e) => setCampusName(e.target.value)}
                  placeholder="Main Campus"
                  required
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={loading}
              >
                Add Campus
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
                    {allFaculties.map((f) => (
                      <SelectItem key={f.faculty_id} value={f.faculty_id}>
                        {f.campusName} →{" "}
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
                        {d.campusName} → {d.facultyName} → {d.acronym || d.name}
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Campuses</CardTitle>
          <CardDescription className="text-xs">
            Used by SEB officer account assignment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campuses.length === 0 ? (
            <p className="text-xs text-muted-foreground">No campuses yet.</p>
          ) : (
            <div className="space-y-2">
              {campuses.map((campus) => (
                <div
                  key={campus.campus_id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 gap-2"
                >
                  {editing?.type === "campus" &&
                  editing.id === campus.campus_id ? (
                    <Input
                      value={editing.name}
                      onChange={(e) => updateEditingName(e.target.value)}
                      className="h-8 max-w-xs"
                      disabled={loading}
                    />
                  ) : (
                    <span className="text-sm font-medium">{campus.name}</span>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    {editing?.type === "campus" &&
                    editing.id === campus.campus_id ? (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={handleSaveEdit}
                          disabled={loading}
                          aria-label={`Save campus ${campus.name}`}
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={handleCancelEdit}
                          disabled={loading}
                          aria-label="Cancel campus edit"
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            startEdit("campus", campus.campus_id, campus.name)
                          }
                          disabled={loading}
                          aria-label={`Edit campus ${campus.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            handleDelete(
                              "campus",
                              campus.campus_id,
                              campus.name,
                            )
                          }
                          disabled={loading}
                          aria-label={`Delete campus ${campus.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Data */}
      {faculties.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground text-sm">
            No faculties yet. Add one above to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campuses.map((campus) => (
            <Card key={campus.campus_id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{campus.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {campus.faculties.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No faculties yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {campus.faculties.map((faculty) => (
                      <div
                        key={faculty.faculty_id}
                        className="border rounded-md p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          {editing?.type === "faculty" &&
                          editing.id === faculty.faculty_id ? (
                            <div className="flex items-center gap-2 w-full max-w-md">
                              <Input
                                value={editing.name}
                                onChange={(e) =>
                                  updateEditingName(e.target.value)
                                }
                                className="h-8 text-sm font-semibold"
                                disabled={loading}
                                placeholder="Faculty name"
                              />
                              <Input
                                value={editing.acronym || ""}
                                onChange={(e) =>
                                  updateEditingAcronym(e.target.value)
                                }
                                className="h-8 w-28 text-sm"
                                disabled={loading}
                                placeholder="Acronym"
                              />
                            </div>
                          ) : (
                            <h4 className="text-sm font-semibold">
                              {faculty.acronym && (
                                <span className="text-primary">
                                  {faculty.acronym}{" "}
                                </span>
                              )}
                              {faculty.name}
                            </h4>
                          )}
                          <div className="flex items-center gap-1 shrink-0">
                            {editing?.type === "faculty" &&
                            editing.id === faculty.faculty_id ? (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  onClick={handleSaveEdit}
                                  disabled={loading}
                                  aria-label={`Save faculty ${faculty.name}`}
                                >
                                  <Check className="size-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  onClick={handleCancelEdit}
                                  disabled={loading}
                                  aria-label="Cancel faculty edit"
                                >
                                  <X className="size-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  onClick={() =>
                                    startEdit(
                                      "faculty",
                                      faculty.faculty_id,
                                      faculty.name,
                                      faculty.acronym,
                                    )
                                  }
                                  disabled={loading}
                                  aria-label={`Edit faculty ${faculty.name}`}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    handleDelete(
                                      "faculty",
                                      faculty.faculty_id,
                                      faculty.name,
                                    )
                                  }
                                  disabled={loading}
                                  aria-label={`Delete faculty ${faculty.name}`}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {faculty.departments.length === 0 ? (
                          <p className="text-xs text-muted-foreground ml-2">
                            No departments yet.
                          </p>
                        ) : (
                          <div className="ml-2 space-y-3">
                            {faculty.departments.map((dept) => (
                              <div
                                key={dept.department_id}
                                className="border rounded-md p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  {editing?.type === "department" &&
                                  editing.id === dept.department_id ? (
                                    <div className="flex items-center gap-2 w-full max-w-md">
                                      <Input
                                        value={editing.name}
                                        onChange={(e) =>
                                          updateEditingName(e.target.value)
                                        }
                                        className="h-8 text-sm font-semibold"
                                        disabled={loading}
                                        placeholder="Department name"
                                      />
                                      <Input
                                        value={editing.acronym || ""}
                                        onChange={(e) =>
                                          updateEditingAcronym(e.target.value)
                                        }
                                        className="h-8 w-28 text-sm"
                                        disabled={loading}
                                        placeholder="Acronym"
                                      />
                                    </div>
                                  ) : (
                                    <h5 className="text-sm font-semibold">
                                      {dept.acronym && (
                                        <span className="text-primary">
                                          {dept.acronym}{" "}
                                        </span>
                                      )}
                                      {dept.name}
                                    </h5>
                                  )}
                                  <div className="flex items-center gap-1 shrink-0">
                                    {editing?.type === "department" &&
                                    editing.id === dept.department_id ? (
                                      <>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="size-7"
                                          onClick={handleSaveEdit}
                                          disabled={loading}
                                          aria-label={`Save department ${dept.name}`}
                                        >
                                          <Check className="size-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="size-7"
                                          onClick={handleCancelEdit}
                                          disabled={loading}
                                          aria-label="Cancel department edit"
                                        >
                                          <X className="size-4" />
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="size-7"
                                          onClick={() =>
                                            startEdit(
                                              "department",
                                              dept.department_id,
                                              dept.name,
                                              dept.acronym,
                                            )
                                          }
                                          disabled={loading}
                                          aria-label={`Edit department ${dept.name}`}
                                        >
                                          <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="size-7 text-destructive hover:text-destructive"
                                          onClick={() =>
                                            handleDelete(
                                              "department",
                                              dept.department_id,
                                              dept.name,
                                            )
                                          }
                                          disabled={loading}
                                          aria-label={`Delete department ${dept.name}`}
                                        >
                                          <Trash2 className="size-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
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
                                        {editing?.type === "course" &&
                                        editing.id === course.course_id ? (
                                          <div className="flex items-center gap-2 w-full max-w-md">
                                            <Input
                                              value={editing.name}
                                              onChange={(e) =>
                                                updateEditingName(
                                                  e.target.value,
                                                )
                                              }
                                              className="h-8 text-sm"
                                              disabled={loading}
                                              placeholder="Course name"
                                            />
                                            <Input
                                              value={editing.acronym || ""}
                                              onChange={(e) =>
                                                updateEditingAcronym(
                                                  e.target.value,
                                                )
                                              }
                                              className="h-8 w-28 text-sm"
                                              disabled={loading}
                                              placeholder="Acronym"
                                            />
                                          </div>
                                        ) : (
                                          <span className="text-sm">
                                            {course.acronym && (
                                              <span className="font-medium text-primary">
                                                {course.acronym} —{" "}
                                              </span>
                                            )}
                                            {course.name}
                                          </span>
                                        )}
                                        <div className="flex items-center gap-1 shrink-0">
                                          {editing?.type === "course" &&
                                          editing.id === course.course_id ? (
                                            <>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-7"
                                                onClick={handleSaveEdit}
                                                disabled={loading}
                                                aria-label={`Save course ${course.name}`}
                                              >
                                                <Check className="size-4" />
                                              </Button>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-7"
                                                onClick={handleCancelEdit}
                                                disabled={loading}
                                                aria-label="Cancel course edit"
                                              >
                                                <X className="size-4" />
                                              </Button>
                                            </>
                                          ) : (
                                            <>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-7"
                                                onClick={() =>
                                                  startEdit(
                                                    "course",
                                                    course.course_id,
                                                    course.name,
                                                    course.acronym,
                                                  )
                                                }
                                                disabled={loading}
                                                aria-label={`Edit course ${course.name}`}
                                              >
                                                <Pencil className="size-4" />
                                              </Button>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 text-destructive hover:text-destructive"
                                                onClick={() =>
                                                  handleDelete(
                                                    "course",
                                                    course.course_id,
                                                    course.name,
                                                  )
                                                }
                                                disabled={loading}
                                                aria-label={`Delete course ${course.name}`}
                                              >
                                                <Trash2 className="size-4" />
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
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
