import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initPWA } from "./lib/pwa";

// Disable error overlay for analytics issues
// @ts-ignore - Handle the runtime error overlay in Vite
const serverAny = window as any;
if (serverAny?.server?.hmr) {
  serverAny.server.hmr.overlay = false;
}

// Initialize PWA capabilities
initPWA();

createRoot(document.getElementById("root")!).render(<App />);
