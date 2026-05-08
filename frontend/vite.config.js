/** @format */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
 plugins: [react(), tailwindcss()],
 root: "./src", // Add this - tells Vite that src is the root
 build: {
  outDir: "../dist", // Add this - output to dist in project root
  emptyOutDir: true, // Add this - clean dist before building
 },
 server: {
  proxy: {
   "/api": "http://localhost:5011",
  },
 },
 resolve: {
  alias: {
   "@": path.resolve(__dirname, "./src"),
  },
 },
});
