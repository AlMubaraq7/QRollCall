import * as reportsService from "./reports.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export async function getCourseReport(req, res) {
  try {
    const report = await reportsService.getCourseReport(req.params.courseId);
    return sendSuccess(res, { report });
  } catch (err) {
    console.error("Get course report error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function getStudentRecord(req, res) {
  const { matricNo } = req.query; // was req.params.matricNo

  if (!matricNo) {
    return sendError(res, "matricNo query parameter is required", 400);
  }

  try {
    const record = await reportsService.getStudentRecordByMatric(matricNo);
    return sendSuccess(res, record);
  } catch (err) {
    if (err.message === "STUDENT_NOT_FOUND") {
      return sendError(res, "No student found with that matric number", 404);
    }
    console.error("Get student record error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function exportSessionCsv(req, res) {
  try {
    const csv = await reportsService.exportSessionAttendanceCsv(
      req.params.sessionId,
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendance-${req.params.sessionId}.csv"`,
    );
    return res.status(200).send(csv);
  } catch (err) {
    if (err.message === "NO_ATTENDANCE_DATA") {
      return sendError(
        res,
        "No attendance records found for this session",
        404,
      );
    }
    console.error("Export CSV error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function getSessionAudit(req, res) {
  try {
    const auditLog = await reportsService.getSessionAuditLog(
      req.params.sessionId,
    );
    return sendSuccess(res, { auditLog });
  } catch (err) {
    console.error("Get session audit error:", err);
    return sendError(res, "Internal server error", 500);
  }
}
