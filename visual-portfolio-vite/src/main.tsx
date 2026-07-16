import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/syne/800.css";
import App from "./App";
import CustomCursor from "./components/CustomCursor";
import SmoothWheelScroll from "./components/SmoothWheelScroll";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SmoothWheelScroll />
    <CustomCursor />
    <App />
  </StrictMode>,
);
