CREATE TABLE attendance_records (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  student_id UUID NOT NULL REFERENCES users(id),
  status     attendance_status DEFAULT 'present',
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  UNIQUE (session_id, student_id)
);

CREATE TABLE qr_audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES sessions(id),
  attempted_by UUID REFERENCES users(id),
  token_used   VARCHAR(255),
  outcome      VARCHAR(50),
  ip_address   INET,
  logged_at    TIMESTAMPTZ DEFAULT NOW()
);