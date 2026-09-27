const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://sriharisivvala216_prog:PortfolioDB2026@cluster0.mongodb.net/stock_portfolio?retryWrites=true&w=majority";

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log(`[Database] MongoDB Connected: ${db.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
    // Don't crash process in serverless; let endpoints report database status gracefully
  }
};

module.exports = connectDB;
