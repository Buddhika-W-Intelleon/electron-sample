import { app, BrowserWindow } from 'electron';
import { spawn } from "child_process";
import * as path from 'path';

let mainWindow: BrowserWindow;
let backendProcess: any;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
if (app.isPackaged) {
    // ❗ IMPORTANT: Load built React app
    mainWindow.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
  } else {
    // Dev mode
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } // React dev mode
}

// START BACKEND ON APP RUN
function startBackend() {
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, "backend/server.js") // <-- exe location
    : path.join(__dirname, "backend/server.js");            // dev

  backendProcess = spawn("node", [backendPath], { shell: true });

  backendProcess.stdout.on("data", (data) => console.log(`Backend: ${data}`));
}

// STOP BACKEND WHEN APP CLOSES
app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
  console.log("Is packaged?", app.isPackaged);
  startBackend();
  createWindow();
});
