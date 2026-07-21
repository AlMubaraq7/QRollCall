import * as sessionsService from "./sessions.service.js";
import { createSessionSchema } from "./sessions.validator.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export async function createSession(req, res) {
  const parsed = createSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, parsed.error.errors[0].message, 400);
  }

  try {
    const session = await sessionsService.createSession({
      ...parsed.data,
      lecturerId: req.user.userId,
    });
    return sendSuccess(res, { session }, 201);
  } catch (err) {
    if (err.message === "NOT_ASSIGNED_TO_COURSE") {
      return sendError(res, "You are not assigned to this course", 403);
    }
    console.error("Create session error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function getSessionById(req, res) {
  try {
    const session = await sessionsService.getSessionById(req.params.id);
    // Never expose the token_secret to any client
    const { token_secret, ...safeSession } = session;
    return sendSuccess(res, { session: safeSession });
  } catch (err) {
    if (err.message === "SESSION_NOT_FOUND") {
      return sendError(res, "Session not found", 404);
    }
    return sendError(res, "Internal server error", 500);
  }
}

export async function closeSession(req, res) {
  try {
    const session = await sessionsService.closeSession(
      req.params.id,
      req.user.userId,
    );
    return sendSuccess(res, { session });
  } catch (err) {
    if (err.message === "SESSION_NOT_FOUND_OR_ALREADY_CLOSED") {
      return sendError(
        res,
        "Session not found, not yours, or already closed",
        404,
      );
    }
    return sendError(res, "Internal server error", 500);
  }
}

export async function cancelSession(req, res) {
  try {
    const session = await sessionsService.cancelSession(
      req.params.id,
      req.user.userId,
    );
    return sendSuccess(res, { session });
  } catch (err) {
    if (err.message === "SESSION_NOT_FOUND_OR_ALREADY_CLOSED") {
      return sendError(
        res,
        "Session not found, not yours, or already closed",
        404,
      );
    }
    return sendError(res, "Internal server error", 500);
  }
}
