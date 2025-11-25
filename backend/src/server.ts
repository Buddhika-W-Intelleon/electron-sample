import * as path from "path";
import express from "express";
import knex from "knex";

const app = express();
app.use(express.json());

// SQLite setup
const db = knex({
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, "database.sqlite"),
  },
  useNullAsDefault: true,
});

// Create tables on startup
async function initDB() {
  const userTable = await db.schema.hasTable("users");
  if (!userTable) {
    await db.schema.createTable("users", (t) => {
      t.increments("id").primary();
      t.string("username");
      t.string("password");
    });
    console.log("✔ users table created");
  }

  const studentTable = await db.schema.hasTable("students");
  if (!studentTable) {
    await db.schema.createTable("students", (t) => {
      t.increments("id").primary();
      t.string("name");
      t.integer("age");
      t.string("course");
    });
    console.log("✔ students table created");
  }
}

initDB();

// Example route
app.get("/api/users", async (req, res) => {
  const users = await db("users").select("*");
  res.json(users);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
