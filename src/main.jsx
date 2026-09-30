import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

function AppWrapper() {

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/firebase-messaging-sw.js")
        .then((reg) => {
          console.log("✅ SW registered:", reg);
        })
        .catch((err) => {
          console.error("❌ SW failed:", err);
        });
    }
  }, []);

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppWrapper />
);