import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PortalApp } from "./portal-app";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PortalApp />
  </StrictMode>,
);
