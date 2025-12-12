// frontend/src/App.tsx
import { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import SetupScreen from "./pages/SetupScreen";
import LoginScreen from "./pages/LoginScreen";
import HomePage from "./pages/Homepage.tsx";  // NEW PAGE
import DatabasePage from "./pages/Database.tsx";
import UploadPage from "./pages/Upload.tsx";

function App() {
  const [backendStatus, setBackendStatus] = useState<"starting" | "ready" | "failed">("starting");
  const [logs, setLogs] = useState<string[]>([]);
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);

  const API_URL = "http://localhost:3001";

  // Listen for backend logs
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onBackendLog((log: string) => {
        setLogs((prev) => [...prev.slice(-50), log]);
      });
    }
  }, []);

  // Poll backend until ready
  useEffect(() => {
  if (backendStatus !== "starting") return;

  let cancelled = false;
  let retries = 0;
  const maxRetries = 100;

  const checkBackend = async () => {
    try {
      const res = await fetch(`${API_URL}/api/check-config`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (!cancelled) {
          setHasConfig(data.exists);
          setBackendStatus("ready");
        }
      }
    } catch (err) {
      retries++;
      if (retries > maxRetries && !cancelled) {
        setBackendStatus("failed");
        return;
      }
      setTimeout(checkBackend, 200);
    }
  };

  checkBackend();

  // ❗ FIXED RETURN TYPE HERE:
  return () => {
    cancelled = true;
  };
}, [backendStatus]);

const styles: Record<string, React.CSSProperties> = {
  loadingScreen: {
    height: "100vh",
    background: "#121212",
    color: "#0f0",
    fontFamily: "Consolas, monospace",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  logBox: {
    background: "#000",
    padding: "1rem",
    borderRadius: 8,
    flex: 1,
    overflow: "auto",
    whiteSpace: "pre-wrap",
  },
  errorScreen: {
    height: "100vh",
    background: "#300",
    color: "#fcc",
    padding: "2rem",
    textAlign: "center",
  },
};


  // ----- UI -----

  if (backendStatus === "starting") {
    return (
      <div style={styles.loadingScreen}>
        <h2>Starting backend server...</h2>
        <div style={styles.logBox}>
          {logs.length === 0 ? "Waiting for backend..." : logs.join("\n")}
        </div>
        <small>This usually takes 2–8 seconds on first launch.</small>
      </div>
    );
  }

  if (backendStatus === "failed") {
    return (
      <div style={styles.errorScreen}>
        <h2>Backend failed to start</h2>
        <p>Check the logs above or try restarting the app.</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {hasConfig ? (
          <>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/login" element={<LoginScreen />} />  {/* LOGIN PAGE */}
            <Route path="/home" element={<HomePage />} />  {/* AFTER LOGIN */}
            <Route path="/database" element={<DatabasePage />} />
            <Route path="/upload" element={<UploadPage />} />
          </>
        ) : (
          <Route path="/" element={<SetupScreen />} />
        )}
      </Routes>
    </HashRouter>
  );
}

export default App;
