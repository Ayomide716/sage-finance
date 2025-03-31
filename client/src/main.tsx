import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initPWA } from "./lib/pwa";

// Initialize PWA capabilities
initPWA();

createRoot(document.getElementById("root")!).render(<App />);
