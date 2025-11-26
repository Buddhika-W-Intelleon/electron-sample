import { useState } from "react";

export default function SetupScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:3001";

  const handleSetup = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/api/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
  };

  if (done) {
    return (
      <div className="container mt-5 text-center">
        <h1 className="text-success">Setup complete! Restart the app.</h1>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card p-4 mx-auto" style={{ maxWidth: "400px" }}>
        <h3 className="text-center mb-3">First Time Setup</h3>
        <input
          className="form-control mb-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="form-control mb-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="btn btn-primary w-100"
          onClick={handleSetup}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Config"}
        </button>
      </div>
    </div>
  );
}
