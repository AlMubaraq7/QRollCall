import pool from "../../config/database.js";
import * as sessionsService from "../sessions/sessions.service.js";

export async function markAttendance({
  sessionId,
  token,
  studentId,
  ipAddress,
  userAgent,
}) {
  // 1. Validate the token against the session (throws SESSION_NOT_FOUND, SESSION_NOT_ACTIVE, or INVALID_TOKEN)
  let session;
  try {
    session = await sessionsService.validateToken(sessionId, token);
  } catch (err) {
    await logAudit({
      sessionId,
      studentId,
      token,
      outcome: err.message,
      ipAddress,
    });
    throw err;
  }

  // 2. Confirm the student is enrolled in this session's course
  const enrollment = await pool.query(
    "SELECT id FROM course_enrollments WHERE course_id = $1 AND student_id = $2",
    [session.course_id, studentId],
  );
  if (enrollment.rows.length === 0) {
    await logAudit({
      sessionId,
      studentId,
      token,
      outcome: "NOT_ENROLLED",
      ipAddress,
    });
    throw new Error("NOT_ENROLLED");
  }

  // 3. Attempt to insert — the UNIQUE constraint on (session_id, student_id) catches duplicates
  try {
    const result = await pool.query(
      `INSERT INTO attendance_records (session_id, student_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)
       RETURNING id, session_id, student_id, status, scanned_at`,
      [sessionId, studentId, ipAddress, userAgent],
    );

    await logAudit({
      sessionId,
      studentId,
      token,
      outcome: "SUCCESS",
      ipAddress,
    });

    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      // PostgreSQL unique_violation error code
      await logAudit({
        sessionId,
        studentId,
        token,
        outcome: "DUPLICATE",
        ipAddress,
      });
      throw new Error("ALREADY_MARKED");
    }
    throw err;
  }
}

export async function getStudentHistory(studentId) {
  const result = await pool.query(
    `SELECT
       ar.id,
       ar.status,
       ar.scanned_at,
       s.title AS session_title,
       c.course_code,
       c.course_name
     FROM attendance_records ar
     JOIN sessions s ON s.id = ar.session_id
     JOIN courses c ON c.id = s.course_id
     WHERE ar.student_id = $1
     ORDER BY ar.scanned_at DESC`,
    [studentId],
  );
  return result.rows;
}

export async function getSessionAttendance(sessionId) {
  const result = await pool.query(
    `SELECT
       ar.id,
       ar.status,
       ar.scanned_at,
       u.full_name,
       u.matric_number
     FROM attendance_records ar
     JOIN users u ON u.id = ar.student_id
     WHERE ar.session_id = $1
     ORDER BY ar.scanned_at ASC`,
    [sessionId],
  );
  return result.rows;
}

export async function getCourseSummaryForStudent(courseId, studentId) {
  const totalSessions = await pool.query(
    `SELECT COUNT(*) AS total FROM sessions WHERE course_id = $1 AND status != 'cancelled'`,
    [courseId],
  );

  const attended = await pool.query(
    `SELECT COUNT(*) AS attended
     FROM attendance_records ar
     JOIN sessions s ON s.id = ar.session_id
     WHERE s.course_id = $1 AND ar.student_id = $2`,
    [courseId, studentId],
  );

  const total = parseInt(totalSessions.rows[0].total, 10);
  const present = parseInt(attended.rows[0].attended, 10);

  return {
    totalSessions: total,
    attended: present,
    percentage: total > 0 ? Math.round((present / total) * 100) : 0,
  };
}

async function logAudit({ sessionId, studentId, token, outcome, ipAddress }) {
  await pool.query(
    `INSERT INTO qr_audit_log (session_id, attempted_by, token_used, outcome, ip_address)
     VALUES ($1, $2, $3, $4, $5)`,
    [sessionId, studentId, token, outcome, ipAddress],
  );
}
