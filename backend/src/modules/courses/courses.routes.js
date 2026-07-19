import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  enrollStudent,
  assignLecturer,
  removeStudent,
} from "./courses.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

// All routes require login
router.use(authenticate);

// Any authenticated user can list and view courses
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// Lecturer-only actions
router.post("/", authorize("lecturer"), createCourse);
router.post("/:id/enroll", authorize("lecturer"), enrollStudent);
router.post("/:id/assign-lecturer", authorize("lecturer"), assignLecturer);
router.delete("/:id/students/:studentId", authorize("lecturer"), removeStudent);

export default router;
