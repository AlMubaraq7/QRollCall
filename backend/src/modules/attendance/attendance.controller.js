import * as attendanceService from "./attendance.service.js";
import { markAttendanceSchema } from "./attendance.validator.js";
import { sendSuccess, sendError } from "../../utils/response.js";

// export async function markAttendance(req, res) {
//   const parsed = markAttendanceSchema.safeParse(req.body);
//   if (!parsed.success) {
//     return sendError(res, parsed.error.errors[0].message, 400);
//   }

//   try {
//     const record = await attendanceService.markAttendance({
//       ...parsed.data,
//       studentId: req.user.userId,
//       ipAddress: req.ip,
//       userAgent: req.headers["user-agent"],
//     });
//     return sendSuccess(res, { record }, 201);
//   } catch (err) {
//     switch (err.message) {
//       case "SESSION_NOT_FOUND":
//         return sendError(res, "Session not found", 404);
//       case "SESSION_NOT_ACTIVE":
//         return sendError(res, "This session is no longer active", 409);
//       case "INVALID_TOKEN":
//         return sendError(
//           res,
//           "QR code is invalid or expired — please rescan",
//           400,
//         );
//       case "NOT_ENROLLED":
//         return sendError(res, "You are not enrolled in this course", 403);
//       case "ALREADY_MARKED":
//         return sendError(
//           res,
//           "You have already marked attendance for this session",
//           409,
//         );
//       default:
//         console.error("Mark attendance error:", err);
//         return sendError(res, "Internal server error", 500);
//     }
//   }
// }
export async function markAttendance(req, res) {
  const parsed = markAttendanceSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, parsed.error.errors[0].message, 400);
  }

  try {
    const record = await attendanceService.markAttendance({
      ...parsed.data,
      studentId: req.user.userId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    return sendSuccess(res, { record }, 201);
  } catch (err) {
    switch (err.message) {
      case "SESSION_NOT_FOUND":
        return sendError(res, "Session not found", 404);
      case "SESSION_NOT_ACTIVE":
        return sendError(res, "This session is no longer active", 409);
      case "INVALID_TOKEN":
        return sendError(
          res,
          "QR code is invalid or expired — please rescan",
          400,
        );
      case "NOT_ENROLLED":
        return sendError(res, "You are not enrolled in this course", 403);
      case "LOCATION_REQUIRED":
        return sendError(
          res,
          "Location access is required to mark attendance for this session",
          400,
        );
      case "OUT_OF_RANGE":
        return sendError(
          res,
          "You must be in the classroom to mark attendance",
          403,
        );
      case "ALREADY_MARKED":
        return sendError(
          res,
          "You have already marked attendance for this session",
          409,
        );
      default:
        console.error("Mark attendance error:", err);
        return sendError(res, "Internal server error", 500);
    }
  }
}

export async function getMyHistory(req, res) {
  try {
    const history = await attendanceService.getStudentHistory(req.user.userId);
    return sendSuccess(res, { history });
  } catch (err) {
    console.error("Get history error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function getSessionAttendance(req, res) {
  try {
    const attendance = await attendanceService.getSessionAttendance(
      req.params.sessionId,
    );
    return sendSuccess(res, { attendance });
  } catch (err) {
    console.error("Get session attendance error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function getCourseSummary(req, res) {
  try {
    const summary = await attendanceService.getCourseSummaryForStudent(
      req.params.courseId,
      req.user.userId,
    );
    return sendSuccess(res, { summary });
  } catch (err) {
    console.error("Get summary error:", err);
    return sendError(res, "Internal server error", 500);
  }
}
