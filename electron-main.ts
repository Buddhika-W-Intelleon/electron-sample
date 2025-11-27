import { app, BrowserWindow } from "electron";
import { fork } from "child_process";
import * as path from "path";
import * as fs from "fs";

let backend: any;
let mainWindow: BrowserWindow | null = null;

// --- Setup logging ---
const logFile = path.join(app.getPath("userData"), "backend.log");

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  fs.appendFileSync(logFile, line + "\n");
  console.log(line);
  if (mainWindow?.webContents) {
    mainWindow.webContents.executeJavaScript(`console.log(${JSON.stringify(line)})`);
  }
}

function logError(msg: string) {
  const line = `[${new Date().toISOString()}] ERROR: ${msg}`;
  fs.appendFileSync(logFile, line + "\n");
  console.error(line);
  if (mainWindow?.webContents) {
    mainWindow.webContents.executeJavaScript(`console.error(${JSON.stringify(line)})`);
  }
}

// --- Start backend ---
function startBackend() {
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, "e-backend", "dist-backend", "server.js")
    : path.join(__dirname, "..", "e-backend", "dist-backend", "server.js");

  log("Backend path: " + backendPath+ " by Calude");
  log("Backend exists? " + fs.existsSync(backendPath));

  if (!fs.existsSync(backendPath)) {
    logError("Backend file not found at: " + backendPath);
    return;
  }

  try {
    backend = fork(backendPath, [], {
      cwd: path.dirname(backendPath),
      stdio: ["pipe", "pipe", "pipe", "ipc"],
      execArgv: [], // Clear any debug flags
      env: { ...process.env, NODE_ENV: "production" }
    });

    log("Backend process forked successfully");

    // --- Capture backend stdout/stderr ---
    backend.stdout?.on("data", (data: Buffer) => {
      log("[BACKEND] " + data.toString().trim());
    });

    backend.stderr?.on("data", (data: Buffer) => {
      logError("[BACKEND] " + data.toString().trim());
    });

    backend.on("exit", (code, signal) => {
      log(`Backend exited with code ${code}, signal ${signal}`);
      backend = null;
    });

    backend.on("error", (err) => {
      logError(`Backend failed to start: ${err.message}`);
      backend = null;
    });

    backend.on("message", (msg) => {
      log(`Backend message: ${JSON.stringify(msg)}`);
    });

  } catch (err: any) {
    logError(`Failed to fork backend: ${err.message}`);
  }
}

// --- Create Electron window ---
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const indexPath = path.join(__dirname, "..", "frontend", "dist", "index.html");
  
  if (fs.existsSync(indexPath)) {
    mainWindow.loadFile(indexPath);
  } else {
    logError("Frontend index.html not found at: " + indexPath);
  }

  mainWindow.webContents.openDevTools({ mode: "detach" });

  // Wait for window to be ready before starting backend
  mainWindow.webContents.once("did-finish-load", () => {
    log("Window loaded, starting backend...");
    startBackend();
  });
}

// --- Global error handlers ---
process.on("uncaughtException", (err) => {
  logError(`Uncaught Exception: ${err.message}\n${err.stack}`);
});

process.on("unhandledRejection", (reason: any) => {
  logError(`Unhandled Rejection: ${reason}`);
});

// --- App lifecycle ---
app.whenReady().then(() => {
  log("Electron app ready");
  createWindow();
});

app.on("window-all-closed", () => {
  log("All windows closed");
  if (backend) {
    log("Killing backend process");
    backend.kill();
  }
  app.quit();
});

app.on("before-quit", () => {
  if (backend) {
    backend.kill();
  }
});