/** @format */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes    = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const adminRoutes   = require("./routes/admin");

const app = express();

// Middleware — allow any localhost port in development
const allowedOrigins = /^http:\/\/localhost:\d+$/;
app.use(
 cors({
  origin: (origin, callback) => {
   // allow requests with no origin (e.g. curl, Postman) or matching localhost
   if (!origin || allowedOrigins.test(origin)) return callback(null, true);
   callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
 }),
);
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", projectRoutes);
app.use("/api", adminRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

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
