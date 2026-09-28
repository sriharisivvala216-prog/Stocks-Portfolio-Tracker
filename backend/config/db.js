const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const primaryURI =
    process.env.MONGODB_URI ||
    "mongodb+srv://userhari:StockApp2026@cluster0.6uptdwi.mongodb.net/stock_portfolio?retryWrites=true&w=majority&appName=Cluster0";
  const localURI = "mongodb://127.0.0.1:27017/stock_portfolio";

  try {
    const db = await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log(`[Database] MongoDB Connected successfully: ${db.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Primary MongoDB connection failed: ${error.message}`);
    if (primaryURI !== localURI) {
      console.log(`[Database] Attempting fallback to local MongoDB (${localURI})...`);
      try {
        const localDb = await mongoose.connect(localURI, {
          serverSelectionTimeoutMS: 3000,
        });
        isConnected = localDb.connections[0].readyState === 1;
        console.log(`[Database] Local MongoDB Connected successfully!`);
      } catch (localErr) {
        console.error(`[Database Error] Local MongoDB fallback failed: ${localErr.message}`);
      }
    }
  }
};

module.exports = connectDB;
