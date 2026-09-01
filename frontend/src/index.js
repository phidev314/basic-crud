import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bulma/css/bulma.css"; // framework css bulma untuk styling dasar
import "./index.css"; // custom styling dan tema modern

// inisialisasi root rendering aplikasi react 18
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
