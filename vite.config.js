import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// `base` is configurable so one build can be served from a domain root or
// from a GitHub Pages project subpath (/myPortfolio/). It is read from the
// process environment (CI) or from a local .env file, in that order.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    base: process.env.VITE_BASE_PATH || env.VITE_BASE_PATH || "/",
    plugins: [react()],
    build: { outDir: "dist", sourcemap: false }
  };
});
