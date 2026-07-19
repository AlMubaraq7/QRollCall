import * as coursesService from "./courses.service.js";
import {
  createCourseSchema,
  enrollStudentSchema,
  assignLecturerSchema,
} from "./courses.validator.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export async function createCourse(req, res) {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, parsed.error.errors[0].message, 400);
  }

  try {
    const course = await coursesService.createCourse(parsed.data);
    return sendSuccess(res, { course }, 201);
  } catch (err) {
    if (err.message === "COURSE_CODE_TAKEN") {
      return sendError(res, "Course code already exists", 409);
    }
    console.error("Create course error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function getAllCourses(req, res) {
  try {
    // Lecturers see only their courses; students see only their enrolled courses
    let courses;
    if (req.user.role === "lecturer") {
      courses = await coursesService.getCoursesForLecturer(req.user.userId);
    } else if (req.user.role === "student") {
      courses = await coursesService.getCoursesForStudent(req.user.userId);
    } else {
      courses = await coursesService.getAllCourses();
    }
    return sendSuccess(res, { courses });
  } catch (err) {
    console.error("Get courses error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function getCourseById(req, res) {
  try {
    const course = await coursesService.getCourseById(req.params.id);
    return sendSuccess(res, { course });
  } catch (err) {
    if (err.message === "COURSE_NOT_FOUND") {
      return sendError(res, "Course not found", 404);
    }
    return sendError(res, "Internal server error", 500);
  }
}

export async function enrollStudent(req, res) {
  const parsed = enrollStudentSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, parsed.error.errors[0].message, 400);
  }

  try {
    const result = await coursesService.enrollStudent(
      req.params.id,
      parsed.data.matricNumber,
    );
    return sendSuccess(res, result, 201);
  } catch (err) {
    if (err.message === "STUDENT_NOT_FOUND") {
      return sendError(res, "No student found with that matric number", 404);
    }
    if (err.message === "ALREADY_ENROLLED") {
      return sendError(res, "Student is already enrolled in this course", 409);
    }
    console.error("Enroll student error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function assignLecturer(req, res) {
  const parsed = assignLecturerSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, parsed.error.errors[0].message, 400);
  }

  try {
    const result = await coursesService.assignLecturer(
      req.params.id,
      parsed.data.lecturerEmail,
    );
    return sendSuccess(res, result, 201);
  } catch (err) {
    if (err.message === "LECTURER_NOT_FOUND") {
      return sendError(res, "No lecturer found with that email", 404);
    }
    if (err.message === "ALREADY_ASSIGNED") {
      return sendError(res, "Lecturer is already assigned to this course", 409);
    }
    console.error("Assign lecturer error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function removeStudent(req, res) {
  try {
    const result = await coursesService.removeStudent(
      req.params.id,
      req.params.studentId,
    );
    return sendSuccess(res, result);
  } catch (err) {
    if (err.message === "ENROLLMENT_NOT_FOUND") {
      return sendError(res, "Enrollment not found", 404);
    }
    return sendError(res, "Internal server error", 500);
  }
}
