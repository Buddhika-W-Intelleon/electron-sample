import { useEffect, useState } from "react";
import Loading from "./windows/Loading.tsx";
import Welcome from "./windows/Welcome.tsx";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000); // fake loading
  }, []);

  return loading ? <Loading /> : <Welcome />;
}

export default App;
