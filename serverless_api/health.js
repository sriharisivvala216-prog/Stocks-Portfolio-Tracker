const connectDB = require("../backend/config/db");
const mongoose = require("mongoose");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  await connectDB();
  const dbState = mongoose.connection.readyState;
  const stateMap = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };

  res.status(200).json({
    status: "OK",
    database: "MongoDB",
    connectionState: stateMap[dbState] || "Unknown",
    timestamp: new Date().toISOString(),
  });
};
