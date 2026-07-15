CREATE TABLE sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      UUID NOT NULL REFERENCES courses(id),
  lecturer_id    UUID NOT NULL REFERENCES users(id),
  title          VARCHAR(255),
  status         session_status DEFAULT 'active',
  token_secret   VARCHAR(255) NOT NULL,
  token_interval INTEGER DEFAULT 30,
  latitude       DECIMAL(10,8),
  longitude      DECIMAL(11,8),
  radius_meters  INTEGER DEFAULT 200,
  started_at     TIMESTAMPTZ DEFAULT NOW(),
  ended_at       TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);