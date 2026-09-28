require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");

const app = express();

// Initialize MongoDB Connection
connectDB();

// ---------------------- Middleware ----------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------- Health Check ----------------------
app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  const dbState = mongoose.connection.readyState;
  const stateMap = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };

  res.json({
    status: "OK",
    database: "MongoDB",
    connectionState: stateMap[dbState] || "Unknown",
    timestamp: new Date().toISOString(),
  });
});

// ---------------------- API Endpoints ----------------------
// Structured modular routes
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);

// Direct compatibility alias routes (supporting `/login`, `/register`, `/portfolio`)
app.use("/", authRoutes);
app.use("/portfolio", portfolioRoutes);

// ---------------------- Serve Client Frontend ----------------------
const clientDistPath = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    // If request path starts with /api or is an API route, pass to next error handler
    if (req.path.startsWith("/api") || req.path === "/login" || req.path === "/register" || req.path.startsWith("/portfolio")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  const rootPath = path.join(__dirname, "..");
  app.use(express.static(rootPath));
}

// ---------------------- Global Error Handler ----------------------
app.use((err, req, res, next) => {
  console.error("[Backend Error]", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
