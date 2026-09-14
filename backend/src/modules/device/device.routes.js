import { Router } from "express";
import {
  getQrToken,
  heartbeat,
  getCurrentSessionForCourse,
} from "./device.controller.js";
import { deviceAuth } from "../../middleware/deviceAuth.js";

const router = Router();

router.use(deviceAuth);

router.get("/session/:sessionId/qr", getQrToken);
router.post("/heartbeat", heartbeat);
router.get("/course/:courseId/current-session", getCurrentSessionForCourse);

export default router;
