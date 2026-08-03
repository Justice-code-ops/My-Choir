import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { useThemeStore } from "./context/themeStore";

function App() {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <RouterProvider router={router} />;
}

export default App;
