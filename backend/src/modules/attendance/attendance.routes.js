import { Router } from "express";
import {
  markAttendance,
  getMyHistory,
  getSessionAttendance,
  getCourseSummary,
} from "./attendance.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate);

router.post("/mark", authorize("student"), markAttendance);
router.get("/history", authorize("student"), getMyHistory);
router.get("/summary/:courseId", authorize("student"), getCourseSummary);
router.get("/session/:sessionId", authorize("lecturer"), getSessionAttendance);

export default router;
