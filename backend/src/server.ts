import path from "path";
import express from "express";
import knex from "knex";
import fs from "fs";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
import { log } from "console";

const app = express();
app.use(express.json());

dotenv.config();

const ENV_PATH = path.join(__dirname, ".env");

// First-time check for .env
function hasEnv() {
  return fs.existsSync(ENV_PATH);
}
function hasEnvData() {
  if (!fs.existsSync(ENV_PATH)) return false;

  const content = fs.readFileSync(ENV_PATH, "utf8");
  return content.includes("ADMIN_USER=") && content.includes("ADMIN_PASS=");
}
// 🔐 Create hashed admin credentials in .env
// createEnv.ts
export async function createEnv(username: string, password: string) {
  const hashedPass = await bcrypt.hash(password, 10);
  const content = `ADMIN_USER=${username}\nADMIN_PASS=${hashedPass}`;
  fs.writeFileSync(ENV_PATH, content);

  dotenv.config({ path: ENV_PATH });
}


// 🔍 Verify login
export async function verifyLogin(username: string, password: string) {
  if (!fs.existsSync(ENV_PATH)) return false;

  const envContent = fs.readFileSync(ENV_PATH, "utf-8");
  const envVars: Record<string, string> = {};
  envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) envVars[key] = value.trim();
  });

  const envUser = envVars["ADMIN_USER"];
  const envPassHash = envVars["ADMIN_PASS"];

  if (!envUser || !envPassHash) return false;
  if (username !== envUser) return false;

  return await bcrypt.compare(password, envPassHash);
}
// ========================
//  SQLITE DB CONFIG
// ========================
const db = knex({
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, "database.sqlite"),
  },
  useNullAsDefault: true,
});

async function initDB() {
  if (!(await db.schema.hasTable("users"))) {
    await db.schema.createTable("users", (t) => {
      t.increments("id").primary();
      t.string("username");
      t.string("password");
    });
    console.log("✔ users table created");
  }

  if (!(await db.schema.hasTable("students"))) {
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

// ========================
//      API ROUTES
// ========================
app.use(cors({
  origin: 'http://localhost:5173', // You can allow multiple later
  methods: ['GET', 'POST'],
  credentials: true,
}));
// SETUP (only first-time)
app.post("/api/setup", async (req, res) => {
  const { username, password } = req.body;

  if (hasEnv()) {
    return res.status(400).json({ message: "Already configured." });
  }

  await createEnv(username, password);
  return res.json({ message: "Setup complete." });
});

app.get("/api/check-config", (req, res) => {
  res.json({ exists: hasEnvData() });
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const ok = await verifyLogin(username, password);
  return res.json({ success: ok });
});

// Example protected route (next step: auth middleware?)
app.get("/api/users", async (req, res) => {
  const users = await db("users").select("*");
  res.json(users);
});

// SERVER
const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
