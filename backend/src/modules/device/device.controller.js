import * as sessionsService from "../sessions/sessions.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export async function getQrToken(req, res) {
  try {
    const result = await sessionsService.generateCurrentToken(
      req.params.sessionId,
    );
    return sendSuccess(res, result);
  } catch (err) {
    if (err.message === "SESSION_NOT_FOUND") {
      return sendError(res, "Session not found", 404);
    }
    if (err.message === "SESSION_NOT_ACTIVE") {
      return sendError(res, "Session is not active", 409);
    }
    console.error("Get QR token error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function heartbeat(req, res) {
  // Simple acknowledgment — extend later to log device status if needed
  return sendSuccess(res, {
    message: "Heartbeat received",
    receivedAt: new Date(),
  });
}

// export async function getCurrentSessionForCourse(req, res) {
//   try {
//     const session = await sessionsService.getActiveSessionForCourse(
//       req.params.courseId,
//     );
//     return sendSuccess(res, { sessionId: session.id, title: session.title });
//   } catch (err) {
//     if (err.message === "NO_ACTIVE_SESSION") {
//       return sendError(res, "No active session for this course", 404);
//     }
//     console.error("Get current session error:", err);
//     return sendError(res, "Internal server error", 500);
//   }
// }
export async function getCurrentSessionForCourse(req, res) {
  try {
    const session = await sessionsService.getActiveSessionForCourse(
      req.params.courseId,
    );
    return sendSuccess(res, {
      sessionId: session.id,
      title: session.title,
      courseCode: session.course_code,
    });
  } catch (err) {
    if (err.message === "NO_ACTIVE_SESSION") {
      return sendError(res, "No active session for this course", 404);
    }
    console.error("Get current session error:", err);
    return sendError(res, "Internal server error", 500);
  }
}
