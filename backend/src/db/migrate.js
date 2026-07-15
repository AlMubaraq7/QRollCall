import path from "path";
import fs from "fs";
import pool from "../config/database.js";
// TODO:UNDERSTAND SQL
async function migrate() {
  const client = await pool.connect();
  try {
    // Create a migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Read all .sql files from migrations folder, sorted by name
    const migrationsDir = path.join(import.meta.dirname, "migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      // Check if this migration has already been applied
      const result = await client.query(
        "SELECT id FROM _migrations WHERE filename = $1",
        [file],
      );

      if (result.rows.length > 0) {
        console.log(`  ✓ Already applied: ${file}`);
        continue;
      }

      // Apply the migration inside a transaction
      console.log(`  → Applying: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO _migrations (filename) VALUES ($1)", [
          file,
        ]);
        await client.query("COMMIT");
        console.log(`  ✓ Applied:  ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`  ✗ Failed:   ${file}`);
        console.error(err.message);
        process.exit(1);
      }
    }

    console.log("\nAll migrations complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
