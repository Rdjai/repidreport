import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";
import App from "./App.tsx";
import { SOSProvider } from "./context/SOSContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SOSProvider>
      <App />
    </SOSProvider>
    <Toaster />
  </StrictMode>
);
