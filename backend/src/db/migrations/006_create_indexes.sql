CREATE INDEX idx_sessions_course_id    ON sessions(course_id);
CREATE INDEX idx_sessions_status       ON sessions(status);
CREATE INDEX idx_attendance_session_id ON attendance_records(session_id);
CREATE INDEX idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX idx_audit_session_id      ON qr_audit_log(session_id);
CREATE INDEX idx_enrollments_student   ON course_enrollments(student_id);