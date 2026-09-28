const mongoose = require("mongoose");
const dns = require("dns");

// Ensure public DNS resolver is used for MongoDB Atlas SRV lookup
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignored if custom DNS cannot be configured in environment
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, lastAttempt: 0 };
}

const connectDB = async () => {
  // 1. If already connected, return cached connection immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // 2. If connection is already in progress, wait for the existing promise
  if (cached.promise) {
    try {
      return await cached.promise;
    } catch {
      return null;
    }
  }

  // 3. Cooldown: do not retry within 20 seconds of a failure to avoid log flooding
  const now = Date.now();
  if (cached.lastAttempt && now - cached.lastAttempt < 20000) {
    return null;
  }
  cached.lastAttempt = now;

  const primaryURI =
    process.env.MONGODB_URI ||
    "mongodb+srv://sriharisivvala216_db_user:sri12345@cluster0.sek0ysr.mongodb.net/stock_portfolio?authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

  const opts = {
    serverSelectionTimeoutMS: 5000,
  };

  cached.promise = (async () => {
    try {
      const conn = await mongoose.connect(primaryURI, opts);
      console.log(`[Database] MongoDB Atlas connected successfully: ${conn.connection.host}`);
      cached.conn = conn;
      cached.promise = null;
      return conn;
    } catch (error) {
      console.error(`[Database Error] MongoDB Atlas connection failed: ${error.message}`);
      cached.promise = null;
      cached.conn = null;

      // Only attempt local fallback if running strictly in local development environment
      const isCloudEnv = !!(process.env.RENDER || process.env.VERCEL || process.env.NODE_ENV === "production");
      if (!isCloudEnv) {
        try {
          await mongoose.disconnect().catch(() => {});
          console.log("[Database] Attempting local MongoDB fallback (mongodb://127.0.0.1:27017/stock_portfolio)...");
          const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/stock_portfolio", {
            serverSelectionTimeoutMS: 2000,
          });
          console.log(`[Database] Local MongoDB connected: ${localConn.connection.host}`);
          cached.conn = localConn;
          return localConn;
        } catch (localErr) {
          console.warn(`[Database] Local MongoDB fallback unavailable: ${localErr.message}`);
        }
      }
      return null;
    }
  })();

  return await cached.promise;
};

module.exports = connectDB;
