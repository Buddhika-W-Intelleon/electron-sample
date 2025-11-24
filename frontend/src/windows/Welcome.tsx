import { useEffect, useState } from "react";

const Welcome = () => {
  const [health, setHealth] = useState("loading...");

  useEffect(() => {
    fetch("http://localhost:3001/health")
      .then(res => res.json())
      .then(data => setHealth(data.status))
      .catch(() => setHealth("backend unavailable"));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome!</h1>
      <p>Backend status: {health}</p>
    </div>
  );
};

export default Welcome;
