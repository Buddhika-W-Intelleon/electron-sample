// frontend/src/electron.d.ts
interface ElectronAPI {
  onBackendLog: (callback: (log: string) => void) => void;
  // Add more methods later if needed, e.g.:
  // sendMessage: (msg: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};