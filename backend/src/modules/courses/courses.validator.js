import { z } from "zod";

export const createCourseSchema = z.object({
  courseCode: z.string().min(2, "Course code is required"),
  courseName: z.string().min(2, "Course name is required"),
  department: z.string().optional(),
});

export const enrollStudentSchema = z.object({
  matricNumber: z.string().min(1, "Matric number is required"),
});

export const assignLecturerSchema = z.object({
  lecturerEmail: z.email("Valid email is required"),
});
