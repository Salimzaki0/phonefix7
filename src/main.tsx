import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill for window.storage: this app was originally built for the Claude.ai
// artifact preview, which provides a built-in key/value storage API. Outside of
// that preview (e.g. here, or once deployed to Netlify), that API doesn't exist,
// so we shim it with localStorage to keep the inbox/requests features working.
if (!(window as any).storage) {
  (window as any).storage = {
    async get(key: string) {
      const raw = localStorage.getItem(key);
      if (raw === null) throw new Error("not found");
      return { key, value: raw, shared: true };
    },
    async set(key: string, value: string) {
      localStorage.setItem(key, value);
      return { key, value, shared: true };
    },
    async delete(key: string) {
      localStorage.removeItem(key);
      return { key, deleted: true, shared: true };
    },
    async list(prefix?: string) {
      const keys = Object.keys(localStorage).filter((k) => !prefix || k.startsWith(prefix));
      return { keys, prefix, shared: true };
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
