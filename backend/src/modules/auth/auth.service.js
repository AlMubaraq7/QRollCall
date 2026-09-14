import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../config/database.js";
import { env } from "../../config/env.js";

const SALT_ROUNDS = 12;

export async function registerUser({
  email,
  password,
  fullName,
  role,
  matricNumber,
  department,
}) {
  // Check if email already exists
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    throw new Error("EMAIL_TAKEN");
  }

  // Students must have a matric number
  if (role === "student") {
    if (!matricNumber) throw new Error("MATRIC_REQUIRED");

    const existingMatric = await pool.query(
      "SELECT id FROM users WHERE matric_number = $1",
      [matricNumber],
    );
    if (existingMatric.rows.length > 0) {
      throw new Error("MATRIC_TAKEN");
    }
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role, matric_number, department)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, full_name, role, matric_number, department, created_at`,
    [
      email,
      passwordHash,
      fullName,
      role,
      matricNumber || null,
      department || null,
    ],
  );

  const user = result.rows[0];
  const token = generateToken(user);

  return { user, token };
}

// export async function loginUser({ email, password }) {
//   const result = await pool.query("SELECT * FROM users WHERE email = $1", [
//     email,
//   ]);

//   if (result.rows.length === 0) {
//     throw new Error("INVALID_CREDENTIALS");
//   }

//   const user = result.rows[0];
//   const passwordMatch = await bcrypt.compare(password, user.password_hash);

//   if (!passwordMatch) {
//     throw new Error("INVALID_CREDENTIALS");
//   }

//   const token = generateToken(user);

//   // Return user without password hash
//   const { password_hash, ...safeUser } = user;
//   return { user: safeUser, token };
// }
export async function loginUser({ identifier, password }) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1 OR matric_number = $1",
    [identifier],
  );

  if (result.rows.length === 0) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = result.rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = generateToken(user);

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function getUserById(id) {
  const result = await pool.query(
    `SELECT id, email, full_name, role, matric_number, department, created_at
     FROM users WHERE id = $1`,
    [id],
  );

  if (result.rows.length === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  return result.rows[0];
}

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn },
  );
}
