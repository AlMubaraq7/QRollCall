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
