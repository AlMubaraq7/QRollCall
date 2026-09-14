import { Pool } from "pg";
import { env } from "./env.js";

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
  ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});
pool.on("error", (err) => {
  console.log("Unexpected database error", err);
  process.exit(1); // exit with failure
});

export default pool;
