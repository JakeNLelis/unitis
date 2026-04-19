export type EditableEntityType = "campus" | "faculty" | "department" | "course";

export interface AcademicCourse {
  course_id: string;
  name: string;
  acronym: string | null;
  department_id: string;
}

export interface AcademicDepartment {
  department_id: string;
  name: string;
  acronym: string | null;
  faculty_id: string;
  courses: AcademicCourse[];
}

export interface AcademicFaculty {
  faculty_id: string;
  campus_id: string;
  name: string;
  acronym: string | null;
  departments: AcademicDepartment[];
}

export interface AcademicCampus {
  campus_id: string;
  name: string;
  created_at: string;
}

export interface EditState {
  type: EditableEntityType;
  id: string;
  name: string;
  acronym?: string;
}

export interface AcademicCampusWithFaculties extends AcademicCampus {
  faculties: AcademicFaculty[];
}
