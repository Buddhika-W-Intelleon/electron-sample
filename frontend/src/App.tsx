import { useEffect, useState } from "react";
// import Loading from "./windows/Loading.tsx";
// import Welcome from "./windows/Welcome.tsx";
import SetupScreen from "./pages/SetupScreen.tsx";
import LoginScreen from "./pages/LoginScreen.tsx";

// function App() {
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setTimeout(() => setLoading(false), 2000); // fake loading
//   }, []);

//   return loading ? <Loading /> : <Welcome />;
// }

// export default App;


function App() {
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);
  const API_URL = "http://localhost:3001";

 useEffect(() => {
    fetch(`${API_URL}/api/check-config`)
      .then((res) => res.json())
      .then((data) => setHasConfig(data.exists))
      .catch(() => setHasConfig(false));  // if backend down → assume fresh install
  }, []);

  if (hasConfig === null) return <div className="container mt-5">Loading...</div>;
  return hasConfig ? <LoginScreen /> : <SetupScreen />;
}

export default App;
