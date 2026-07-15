CREATE TYPE user_role AS ENUM ('student', 'lecturer');
CREATE TYPE session_status AS ENUM ('active', 'closed', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('present', 'late');