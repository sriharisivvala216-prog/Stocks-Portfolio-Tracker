const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const primaryURI =
    process.env.MONGODB_URI ||
    "mongodb+srv://sriharisivvala216_db_user:sri12345@cluster0.sek0ysr.mongodb.net/stock_portfolio?retryWrites=true&w=majority&appName=Cluster0";
  const localURI = "mongodb://127.0.0.1:27017/stock_portfolio";

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose
      .connect(primaryURI, opts)
      .then((mongooseInstance) => {
        console.log(`[Database] MongoDB Connected successfully: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch(async (error) => {
        console.error(`[Database Error] Primary MongoDB connection failed: ${error.message}`);
        cached.promise = null;
        if (primaryURI !== localURI) {
          console.log(`[Database] Attempting fallback to local MongoDB (${localURI})...`);
          try {
            return await mongoose.connect(localURI, { serverSelectionTimeoutMS: 3000 });
          } catch (localErr) {
            console.error(`[Database Error] Local MongoDB fallback failed: ${localErr.message}`);
          }
        }
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error(`[Database Error] Connection threw error: ${e.message}`);
  }
};

module.exports = connectDB;
