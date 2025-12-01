// backend/src/server.ts
import knex = require ("knex");
import path = require("path");
import express = require("express");
import fs = require("fs");
import bcrypt = require("bcrypt");
import dotenv = require("dotenv");
import cors = require("cors");
import { log } from "./logger";
import multer = require("multer") 
log.info("Backend starting");
// Detect packaged mode
const isPackaged = (() => {
  if (process.env.PORTABLE_EXECUTABLE_DIR) return true;
  if (process.argv[0].includes("resources\\app")) return true;
  if (process.argv[0].endsWith(".exe") && !process.argv[0].includes("node")) return true;
  if (!process.execPath.includes("node") && !process.execPath.includes("node.exe")) return true;
  return false;
})();

function getAppDataDir() {
  if (isPackaged) {
    const exeDir = path.dirname(process.execPath);
    const dataDir = path.join(exeDir, "data");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      log.info("Created data folder: " + dataDir);
    }
    return dataDir;
  }
  return path.join(__dirname, "..");
}

const APP_DATA_DIR = getAppDataDir();
const ENV_PATH = path.join(APP_DATA_DIR, ".env");
const DB_PATH = path.join(APP_DATA_DIR, "database.sqlite");

log.info("=== Backend starting ===");
log.info(`Packaged: ${isPackaged}`);
log.info(`Data directory: ${APP_DATA_DIR}`);
log.info(`Env path: ${ENV_PATH}`);
log.info(`DB path: ${DB_PATH}`);

// Load environment
if (fs.existsSync(ENV_PATH)) {
  dotenv.config({ path: ENV_PATH });
  log.info(".env loaded");
} else {
  log.warn("No .env found → first-time setup needed");
}

// Knex DB Init
const db = knex({
  client: "sqlite3",
  connection: { filename: DB_PATH },
  useNullAsDefault: true,
});

async function initDB() {
  try {
    if (!(await db.schema.hasTable("users"))) {
      await db.schema.createTable("users", (t) => {
        t.increments("id").primary();
        t.string("username");
        t.string("password");
      });
      log.info("users table created");
    }

    if (!(await db.schema.hasTable("students"))) {
      await db.schema.createTable("students", (t) => {
        t.increments("id").primary();
        t.string("name");
        t.integer("age");
        t.string("course");
      });
      log.info("students table created");
    }
  } catch (err: any) {
    log.error("DB init error: " + err.message);
  }
}
initDB();

// Helpers
function hasEnvFile() {
  return fs.existsSync(ENV_PATH);
}

function hasEnvData() {
  if (!hasEnvFile()) return false;
  const content = fs.readFileSync(ENV_PATH, "utf-8");
  return (
    content.includes("ADMIN_USER=") &&
    content.includes("ADMIN_PASS=") &&
    !content.includes("ADMIN_PASS=\n")
  );
}

// Express
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Routes
app.post("/api/setup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Required fields" });
    if (hasEnvFile()) return res.status(400).json({ message: "Already configured" });

    const hashed = await bcrypt.hash(password, 10);
    fs.writeFileSync(ENV_PATH, `ADMIN_USER=${username}\nADMIN_PASS=${hashed}\n`);

    dotenv.config({ path: ENV_PATH });
    log.info(`.env created at ${ENV_PATH}`);
    res.json({ message: "Setup complete" });
  } catch (err: any) {
    log.error("Setup error: " + err.message);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/check-config", (_req, res) => {
  res.json({ exists: hasEnvData() });
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!hasEnvFile()) return res.json({ success: false });

    const content = fs.readFileSync(ENV_PATH, "utf-8");
    const user = content.match(/^ADMIN_USER=(.*)$/m)?.[1]?.trim();
    const hash = content.match(/^ADMIN_PASS=(.*)$/m)?.[1]?.trim();

    const isValid = username === user && await bcrypt.compare(password, hash || "");
    log.info(`Login attempt for user: ${username} → ${isValid}`);
    res.json({ success: isValid });
  } catch (err: any) {
    log.error("Login error: " + err.message);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

const upload = multer({ storage: multer.memoryStorage() });

// --- Create files table if it doesn't exist ---
async function initFilesTable() {
  try {
    const exists = await db.schema.hasTable("files");
    if (!exists) {
      await db.schema.createTable("files", (t) => {
        t.increments("id").primary();
        t.text("file"); // Base64 string
      });
      log.info("files table created");
    }
  } catch (err: any) {
    log.error("DB init error (files table): " + err.message);
  }
}
initFilesTable();

// --- Upload route ---
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const base64Data = req.file.buffer.toString("base64");

    // Store in DB
    await db("files").insert({ file: base64Data });

    log.info(`File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);
    res.json({ success: true });
  } catch (err: any) {
    log.error("Upload error: " + err.message);
    res.status(500).json({ error: "Internal error" });
  }
});

// Start backend
const PORT:number = Number(process.env.PORT || 3001);
app.listen(PORT, "0.0.0.0", () => {
  log.info(`Backend RUNNING on http://localhost:${PORT}`);
  log.info(`Data stored at: ${APP_DATA_DIR}`);
});


module.exports = app
