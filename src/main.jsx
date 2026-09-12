import React from "react";
import { createRoot } from "react-dom/client";
import Portfolio from "./components/Portfolio.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Portfolio />
  </React.StrictMode>
);
