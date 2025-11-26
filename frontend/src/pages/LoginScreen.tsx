import { useState } from "react";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = "http://localhost:3001";

  const handleLogin = async () => {
    setLoading(true)
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false)
    if (data.success) alert("Welcome!");
    else setError("Invalid credentials.");
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 mx-auto" style={{ maxWidth: "400px" }}>
        <h3 className="text-center mb-3">Login</h3>
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
        {error && <div className="text-danger mb-2">{error}</div>}
        <button className="btn btn-primary w-100" onClick={handleLogin} disabled={loading} >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
