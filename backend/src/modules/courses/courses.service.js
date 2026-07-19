import pool from "../../config/database.js";

export async function createCourse({ courseCode, courseName, department }) {
  const existing = await pool.query(
    "SELECT id FROM courses WHERE course_code = $1",
    [courseCode],
  );
  if (existing.rows.length > 0) {
    throw new Error("COURSE_CODE_TAKEN");
  }

  const result = await pool.query(
    `INSERT INTO courses (course_code, course_name, department)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [courseCode, courseName, department || null],
  );

  return result.rows[0];
}

export async function getAllCourses() {
  const result = await pool.query(
    `SELECT
       c.id,
       c.course_code,
       c.course_name,
       c.department,
       c.created_at,
       COUNT(DISTINCT ce.student_id) AS student_count,
       COUNT(DISTINCT cl.lecturer_id) AS lecturer_count
     FROM courses c
     LEFT JOIN course_enrollments ce ON ce.course_id = c.id
     LEFT JOIN course_lecturers cl ON cl.course_id = c.id
     GROUP BY c.id
     ORDER BY c.course_code`,
  );
  return result.rows;
}

export async function getCourseById(courseId) {
  const course = await pool.query("SELECT * FROM courses WHERE id = $1", [
    courseId,
  ]);
  if (course.rows.length === 0) {
    throw new Error("COURSE_NOT_FOUND");
  }

  // Get enrolled students
  const students = await pool.query(
    `SELECT u.id, u.full_name, u.matric_number, u.email, ce.enrolled_at
     FROM course_enrollments ce
     JOIN users u ON u.id = ce.student_id
     WHERE ce.course_id = $1
     ORDER BY u.full_name`,
    [courseId],
  );

  // Get assigned lecturers
  const lecturers = await pool.query(
    `SELECT u.id, u.full_name, u.email, cl.id AS assignment_id
     FROM course_lecturers cl
     JOIN users u ON u.id = cl.lecturer_id
     WHERE cl.course_id = $1`,
    [courseId],
  );

  return {
    ...course.rows[0],
    students: students.rows,
    lecturers: lecturers.rows,
  };
}

export async function getCoursesForLecturer(lecturerId) {
  const result = await pool.query(
    `SELECT
       c.id,
       c.course_code,
       c.course_name,
       c.department,
       COUNT(DISTINCT ce.student_id) AS student_count
     FROM courses c
     JOIN course_lecturers cl ON cl.course_id = c.id
     LEFT JOIN course_enrollments ce ON ce.course_id = c.id
     WHERE cl.lecturer_id = $1
     GROUP BY c.id
     ORDER BY c.course_code`,
    [lecturerId],
  );
  return result.rows;
}

export async function getCoursesForStudent(studentId) {
  const result = await pool.query(
    `SELECT
       c.id,
       c.course_code,
       c.course_name,
       c.department,
       ce.enrolled_at
     FROM courses c
     JOIN course_enrollments ce ON ce.course_id = c.id
     WHERE ce.student_id = $1
     ORDER BY c.course_code`,
    [studentId],
  );
  return result.rows;
}

export async function enrollStudent(courseId, matricNumber) {
  // Find the student
  const studentResult = await pool.query(
    "SELECT id FROM users WHERE matric_number = $1 AND role = $2",
    [matricNumber, "student"],
  );
  if (studentResult.rows.length === 0) {
    throw new Error("STUDENT_NOT_FOUND");
  }

  const studentId = studentResult.rows[0].id;

  // Check not already enrolled
  const existing = await pool.query(
    "SELECT id FROM course_enrollments WHERE course_id = $1 AND student_id = $2",
    [courseId, studentId],
  );
  if (existing.rows.length > 0) {
    throw new Error("ALREADY_ENROLLED");
  }

  await pool.query(
    "INSERT INTO course_enrollments (course_id, student_id) VALUES ($1, $2)",
    [courseId, studentId],
  );

  return { message: "Student enrolled successfully" };
}

export async function assignLecturer(courseId, lecturerEmail) {
  // Find the lecturer
  const lecturerResult = await pool.query(
    "SELECT id FROM users WHERE email = $1 AND role = $2",
    [lecturerEmail, "lecturer"],
  );
  if (lecturerResult.rows.length === 0) {
    throw new Error("LECTURER_NOT_FOUND");
  }

  const lecturerId = lecturerResult.rows[0].id;

  // Check not already assigned
  const existing = await pool.query(
    "SELECT id FROM course_lecturers WHERE course_id = $1 AND lecturer_id = $2",
    [courseId, lecturerId],
  );
  if (existing.rows.length > 0) {
    throw new Error("ALREADY_ASSIGNED");
  }

  await pool.query(
    "INSERT INTO course_lecturers (course_id, lecturer_id) VALUES ($1, $2)",
    [courseId, lecturerId],
  );

  return { message: "Lecturer assigned successfully" };
}

export async function removeStudent(courseId, studentId) {
  const result = await pool.query(
    "DELETE FROM course_enrollments WHERE course_id = $1 AND student_id = $2 RETURNING id",
    [courseId, studentId],
  );
  if (result.rows.length === 0) {
    throw new Error("ENROLLMENT_NOT_FOUND");
  }
  return { message: "Student removed from course" };
}
