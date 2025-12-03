// preload.ts (in root or dist-electron folder)
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  onBackendLog: (callback: (log: string) => void) =>
    ipcRenderer.on("backend-log", (_event, log) => callback(log)),
    selectFolder: () => ipcRenderer.invoke("select-image-folder")
});