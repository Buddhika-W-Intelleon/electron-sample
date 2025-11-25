import { app, BrowserWindow } from 'electron';
import { spawn } from "child_process";
import path from 'path';

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

  mainWindow.loadURL("http://localhost:5173"); // React dev mode
}

// START BACKEND ON APP RUN
function startBackend() {
  const backendPath = path.join(__dirname, "backend/server.js");
  backendProcess = spawn("node", [backendPath], { shell: true });

  backendProcess.stdout.on("data", (data) => {
    console.log(`Backend: ${data}`);
  });
}

// STOP BACKEND WHEN APP CLOSES
app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
  startBackend();
  createWindow();
});
