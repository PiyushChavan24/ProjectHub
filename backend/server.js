/** @format */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRoutes    = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const adminRoutes   = require("./routes/admin");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// ALLOWED_ORIGINS in .env: comma-separated production URLs
// e.g. ALLOWED_ORIGINS=https://projecthub.vercel.app,https://yourdomain.com
const extraOrigins = process.env.ALLOWED_ORIGINS
 ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
 : [];

app.use(
 cors({
  origin: (origin, callback) => {
   if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
   if (extraOrigins.includes(origin)) return callback(null, true);
   callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
 }),
);
app.use(express.json());

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api", authRoutes);
app.use("/api", projectRoutes);
app.use("/api", adminRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ── Static frontend (EC2 / single-server deployment) ─────────────────────────
// Only activates when the React build exists (after npm run build in frontend/)
const distPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(distPath)) {
 app.use(express.static(distPath));
 app.get("*", (req, res) =>
  res.sendFile(path.join(distPath, "index.html"))
 );
} else {
 // API-only deployment (Render / separate backend host)
 app.get("/", (req, res) =>
  res.json({ message: "ProjectHub API is running", status: "ok" })
 );
}

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
 .connect(process.env.MONGO_URI)
 .then(() => {
  console.log("MongoDB connected");
  app.listen(PORT, () =>
   console.log(`Server running on http://localhost:${PORT}`),
  );
 })
 .catch((err) => {
  console.error("MongoDB connection error:", err.message);
  process.exit(1);
 });
