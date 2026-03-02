--- app/types.ts (原始)


+++ app/types.ts (修改后)
// User types
export type UserRole = 'student' | 'teacher';

export type EducationLevel = 'primary' | 'secondary' | 'university';

export type StudentType = 'primary_student' | 'secondary_student' | 'university_student';

export type TeacherType = 'primary_teacher' | 'secondary_teacher' | 'lecturer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentType?: StudentType;
  teacherType?: TeacherType;
  universityProgram?: string; // For university students
  createdAt: Date;
  updatedAt: Date;
}

// Login/Signup forms
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignupFormValues extends LoginFormValues {
  name: string;
  role: UserRole;
  studentType?: StudentType;
  teacherType?: TeacherType;
  universityProgram?: string;
}