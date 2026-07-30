import { Router } from "express";
import {
  getCourseReport,
  getStudentRecord,
  exportSessionCsv,
} from "./reports.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate);
router.use(authorize("lecturer"));

router.get("/course/:courseId", getCourseReport);
router.get("/student", getStudentRecord);
router.get("/session/:sessionId/export", exportSessionCsv);

export default router;
