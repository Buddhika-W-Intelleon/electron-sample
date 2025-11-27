// frontend/src/App.tsx
import { useEffect, useState } from "react";
import SetupScreen from "./pages/SetupScreen";
import LoginScreen from "./pages/LoginScreen";

function App() {
  const [backendStatus, setBackendStatus] = useState<
    "starting" | "ready" | "failed"
  >("starting");
  const [logs, setLogs] = useState<string[]>([]);
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);

  const API_URL = "http://localhost:3001";

  // ───── Listen to backend logs from Electron main process ─────
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onBackendLog((log: string) => {
        setLogs((prev) => [...prev.slice(-50), log]); // keep last 50 lines
      });
    }
  }, []);

  // ───── Poll backend health until it answers ─────
  useEffect(() => {
    if (backendStatus !== "starting") return;

    let cancelled = false;
    let retries = 0;
    const maxRetries = 100; // ~20 seconds max

    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/api/check-config`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setHasConfig(data.exists);
            setBackendStatus("ready");
          }
        }
      } catch (err) {
        retries++;
        if (retries > maxRetries) {
          if (!cancelled) setBackendStatus("failed");
          return;
        }
        // retry after 200ms
        setTimeout(checkBackend, 200);
      }
    };

    checkBackend();

    return () => {
      cancelled = true;
    };
  }, [backendStatus]);

  // ───── UI ─────
  if (backendStatus === "starting") {
    return (
      <div
        style={{
          height: "100vh",
          background: "#121212",
          color: "#0f0",
          fontFamily: "Consolas, monospace",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2>Starting backend server...</h2>
        <div
          style={{
            background: "#000",
            padding: "1rem",
            borderRadius: 8,
            flex: 1,
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {logs.length === 0 ? "Waiting for backend..." : logs.join("\n")}
        </div>
        <small>
          This usually takes 2–8 seconds on first launch.
        </small>
      </div>
    );
  }

  if (backendStatus === "failed") {
    return (
      <div
        style={{
          height: "100vh",
          background: "#300",
          color: "#fcc",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h2>Backend failed to start</h2>
        <p>Check the logs above or try restarting the app.</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  // Backend is ready → normal flow
  if (hasConfig === null) {
    return <div className="container mt-5">Checking configuration...</div>;
  }

  return hasConfig ? <LoginScreen /> : <SetupScreen />;
}

export default App;