const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://userhari:23user2026@cluster0.6uptdwi.mongodb.net/stock_portfolio?retryWrites=true&w=majority&appName=Cluster0";

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log(`[Database] MongoDB Connected successfully: ${db.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
