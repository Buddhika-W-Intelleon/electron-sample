import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SetupScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = "http://localhost:3001";

  const pickFolder = async () => {
    const folder = await window.electronAPI.selectFolder();
    if (folder) setImagePath(folder);
  };

  const handleSetup = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/api/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        imagePath
      }),
    });

    setLoading(false);
    if (res.ok) setDone(true);
  };

  if (done) {
    navigate("/home");
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
          className="form-control mb-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="d-flex mb-3">
          <input
            className="form-control me-2"
            placeholder="Image Folder"
            value={imagePath}
            disabled
          />
          <button className="btn btn-secondary" onClick={pickFolder}>
            Browse
          </button>
        </div>

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
