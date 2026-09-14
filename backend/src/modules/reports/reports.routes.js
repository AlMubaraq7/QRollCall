import { Router } from "express";
import {
  getCourseReport,
  getStudentRecord,
  exportSessionCsv,
  getSessionAudit,
} from "./reports.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate);
router.use(authorize("lecturer"));

router.get("/course/:courseId", getCourseReport);
router.get("/student", getStudentRecord);
router.get("/session/:sessionId/export", exportSessionCsv);
router.get("/session/:sessionId/audit", getSessionAudit);

export default router;
