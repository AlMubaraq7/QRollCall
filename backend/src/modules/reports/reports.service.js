import { AsyncParser } from "@json2csv/node";
import pool from "../../config/database.js";

export async function getCourseReport(courseId) {
  const result = await pool.query(
    `SELECT
       s.id AS session_id,
       s.title,
       s.status,
       s.started_at,
       s.ended_at,
       COUNT(ar.id) AS attendee_count
     FROM sessions s
     LEFT JOIN attendance_records ar ON ar.session_id = s.id
     WHERE s.course_id = $1
     GROUP BY s.id
     ORDER BY s.started_at DESC`,
    [courseId],
  );
  return result.rows;
}

export async function getStudentRecordByMatric(matricNumber) {
  const student = await pool.query(
    "SELECT id, full_name, matric_number FROM users WHERE matric_number = $1 AND role = $2",
    [matricNumber, "student"],
  );
  if (student.rows.length === 0) {
    throw new Error("STUDENT_NOT_FOUND");
  }

  const records = await pool.query(
    `SELECT
       c.course_code,
       c.course_name,
       s.title AS session_title,
       ar.status,
       ar.scanned_at
     FROM attendance_records ar
     JOIN sessions s ON s.id = ar.session_id
     JOIN courses c ON c.id = s.course_id
     WHERE ar.student_id = $1
     ORDER BY ar.scanned_at DESC`,
    [student.rows[0].id],
  );

  return {
    student: student.rows[0],
    records: records.rows,
  };
}

export async function exportSessionAttendanceCsv(sessionId) {
  const result = await pool.query(
    `SELECT
       u.matric_number,
       u.full_name,
       ar.status,
       ar.scanned_at
     FROM attendance_records ar
     JOIN users u ON u.id = ar.student_id
     WHERE ar.session_id = $1
     ORDER BY u.full_name`,
    [sessionId],
  );

  if (result.rows.length === 0) {
    throw new Error("NO_ATTENDANCE_DATA");
  }

  const fields = ["matric_number", "full_name", "status", "scanned_at"];
  const parser = new AsyncParser({ fields });

  const csv = await parser.parse(result.rows).promise();
  return csv;
}

export async function getSessionAuditLog(sessionId) {
  const result = await pool.query(
    `SELECT
       al.id,
       al.outcome,
       al.token_used,
       al.ip_address,
       al.logged_at,
       u.full_name,
       u.matric_number
     FROM qr_audit_log al
     LEFT JOIN users u ON u.id = al.attempted_by
     WHERE al.session_id = $1
     ORDER BY al.logged_at DESC`,
    [sessionId],
  );
  return result.rows;
}
