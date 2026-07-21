import { Router } from "express";
import {
  createSession,
  getSessionById,
  closeSession,
  cancelSession,
} from "./sessions.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate);

router.post("/", authorize("lecturer"), createSession);
router.get("/:id", getSessionById);
router.patch("/:id/close", authorize("lecturer"), closeSession);
router.patch("/:id/cancel", authorize("lecturer"), cancelSession);

export default router;
