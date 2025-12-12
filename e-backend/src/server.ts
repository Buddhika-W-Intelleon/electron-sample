// backend/src/server.ts
import knex = require ("knex");
import path = require("path");
import express = require("express");
import fs = require("fs");
import bcrypt = require("bcrypt");
import dotenv = require("dotenv");
import cors = require("cors");
import { log } from "./logger";
import ini = require("ini");
import multer = require("multer");

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
//Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

log.info("=== Backend starting ===");
log.info(`Packaged: ${isPackaged}`);
log.info(`Data directory: ${APP_DATA_DIR}`);
log.info(`Env path: ${ENV_PATH}`);
log.info(`DB path: ${DB_PATH}`);

const SETTINGS_PATH = path.join(APP_DATA_DIR, "settings.ini");

// Create default .ini if it doesn't exist
function initSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) {
    const defaultSettings = {
      general: {
        imageFolder: path.join(APP_DATA_DIR, "images"),
        theme: "light",
      },
      user: {
        lastLogin: "",
      },
    };
    fs.writeFileSync(SETTINGS_PATH, ini.stringify(defaultSettings));
    log.info("Created default settings.ini at " + SETTINGS_PATH);
  }
}
// Read settings
function readSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) return {};
  const content = fs.readFileSync(SETTINGS_PATH, "utf-8");
  return ini.parse(content);
}
function writeSettings(settings: any) {
  fs.writeFileSync(SETTINGS_PATH, ini.stringify(settings));
  log.info("Updated settings.ini");
}

initSettings();
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
    await db.schema.hasTable("students").then(async (exists) => {
      if (!exists) {
        await db.schema.createTable("students", (table) => {
          table.increments("studentId").primary();
          table.string("name").notNullable();
          table.string("address").notNullable();
          table.string("class").notNullable();
        });

        console.log("Students table created");
      }
    });

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
    const { username, password, imagePath } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Required fields" });
    if (hasEnvFile()) return res.status(400).json({ message: "Already configured" });

    // Save admin credentials to .env
    const hashed = await bcrypt.hash(password, 10);
    fs.writeFileSync(ENV_PATH, `ADMIN_USER=${username}\nADMIN_PASS=${hashed}\n`);
    dotenv.config({ path: ENV_PATH });
    log.info(`.env created at ${ENV_PATH}`);

    // Save image folder to settings.ini
    const settings = readSettings();
    settings.general = settings.general || {};
    settings.general.imageFolder = imagePath || path.join(APP_DATA_DIR, "images");
    writeSettings(settings);

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

//Student stuff
app.get("/api/students/list", async (_req, res) => {
  try {
    const data = await db("students").select("*");
    res.json(data);
  } catch (err: any) {
    log.error("Students list error: " + err.message);
    res.status(500).json({ error: "Internal error" });
  }
});
app.post("/api/students/add", async (req, res) => {
  try {
    const { name, age, course } = req.body;

    if (!name || !age || !course) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const [id] = await db("students").insert({ name, age, course });

    log.info(`Student added (id=${id})`);

    res.json({ success: true, id });
  } catch (err: any) {
    log.error("Add student error: " + err.message);
    res.status(500).json({ error: "Internal error" });
  }
});
app.put("/api/students/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, course } = req.body;

    const exists = await db("students").where({ id }).first();
    if (!exists) return res.status(404).json({ error: "Student not found" });

    await db("students")
      .where({ id })
      .update({ name, age, course });

    log.info(`Student updated (id=${id})`);

    res.json({ success: true });
  } catch (err: any) {
    log.error("Update student error: " + err.message);
    res.status(500).json({ error: "Internal error" });
  }
});
app.delete("/api/students/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const exists = await db("students").where({ id }).first();
    if (!exists) return res.status(404).json({ error: "Student not found" });

    await db("students").where({ id }).del();

    log.info(`Student deleted (id=${id})`);

    res.json({ success: true });
  } catch (err: any) {
    log.error("Delete student error: " + err.message);
    res.status(500).json({ error: "Internal error" });
  }
});


// Upload endpoint—save file to folder in settings.ini
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Load settings.ini
    const settings = readSettings();
    const folder = settings?.general?.imageFolder;

    if (!folder) {
      return res.status(500).json({ error: "Image folder not configured" });
    }

    // Ensure the folder exists
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      log.info("Created image folder at: " + folder);
    }

    // Build file path (preserve original filename)
    const savePath = path.join(folder, req.file.originalname);

    // Save file to disk
    fs.writeFileSync(savePath, req.file.buffer);

    log.info(`Saved image to: ${savePath}`);

    res.json({ success: true, path: savePath });

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
