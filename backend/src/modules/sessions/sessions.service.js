import { generate, verify, generateSecret } from "otplib";
import pool from "../../config/database.js";

export async function createSession({
  courseId,
  lecturerId,
  title,
  tokenInterval,
}) {
  const assigned = await pool.query(
    "SELECT id FROM course_lecturers WHERE course_id = $1 AND lecturer_id = $2",
    [courseId, lecturerId],
  );
  if (assigned.rows.length === 0) {
    throw new Error("NOT_ASSIGNED_TO_COURSE");
  }

  const secret = generateSecret(); // base32 string, uses default bundled plugins

  const result = await pool.query(
    `INSERT INTO sessions (course_id, lecturer_id, title, token_secret, token_interval)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, course_id, lecturer_id, title, status, token_interval, started_at`,
    [courseId, lecturerId, title || null, secret, tokenInterval || 30],
  );

  return result.rows[0];
}

export async function getSessionById(sessionId) {
  const result = await pool.query("SELECT * FROM sessions WHERE id = $1", [
    sessionId,
  ]);
  if (result.rows.length === 0) {
    throw new Error("SESSION_NOT_FOUND");
  }
  return result.rows[0];
}

export async function getSessionsForCourse(courseId) {
  const result = await pool.query(
    `SELECT id, title, status, started_at, ended_at
     FROM sessions WHERE course_id = $1 ORDER BY started_at DESC`,
    [courseId],
  );
  return result.rows;
}

export async function closeSession(sessionId, lecturerId) {
  const result = await pool.query(
    `UPDATE sessions SET status = 'closed', ended_at = NOW()
     WHERE id = $1 AND lecturer_id = $2 AND status = 'active'
     RETURNING id, status, ended_at`,
    [sessionId, lecturerId],
  );
  if (result.rows.length === 0) {
    throw new Error("SESSION_NOT_FOUND_OR_ALREADY_CLOSED");
  }
  return result.rows[0];
}

export async function cancelSession(sessionId, lecturerId) {
  const result = await pool.query(
    `UPDATE sessions SET status = 'cancelled', ended_at = NOW()
     WHERE id = $1 AND lecturer_id = $2 AND status = 'active'
     RETURNING id, status, ended_at`,
    [sessionId, lecturerId],
  );
  if (result.rows.length === 0) {
    throw new Error("SESSION_NOT_FOUND_OR_ALREADY_CLOSED");
  }
  return result.rows[0];
}

// ---- QR token generation & validation ----

export async function generateCurrentToken(sessionId) {
  const session = await getSessionById(sessionId);

  if (session.status !== "active") {
    throw new Error("SESSION_NOT_ACTIVE");
  }

  const token = await generate({
    secret: session.token_secret,
    period: session.token_interval,
  });

  return {
    token,
    interval: session.token_interval,
    generatedAt: Date.now(),
  };
}

export async function validateToken(sessionId, token) {
  const session = await getSessionById(sessionId);

  if (session.status !== "active") {
    throw new Error("SESSION_NOT_ACTIVE");
  }

  const result = await verify({
    secret: session.token_secret,
    token,
    period: session.token_interval,
    epochTolerance: session.token_interval, // accept current step ± 1 step, in seconds
  });

  if (!result.valid) {
    throw new Error("INVALID_TOKEN");
  }

  return session;
}
