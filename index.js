// ---------------------- Imports ----------------------
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

// ---------------------- App Setup ----------------------
const app = express();
const PORT = process.env.PORT || 5000;

const SECRET = process.env.JWT_SECRET || "71fbc7fd1de400996382ccf5c8038da93d31896d158e86cc6a75a47fec5da333a9405d68bbc80aefe5cf624a4dd5a5697dc810e45d23b3362afb2048dd065a23";
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "d302t41r01qnmrscnpa0d302t41r01qnmrscnpag";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/stock_portfolio";

app.use(cors());
app.use(bodyParser.json());

// ---------------------- Database Layer ----------------------
let isMongoConnected = false;

// Mongoose Schemas & Models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const portfolioSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  companySymbol: { type: String, required: true, uppercase: true, trim: true },
  companyName: { type: String, required: true, trim: true },
  transactionType: { type: String, required: true, uppercase: true, enum: ["BUY", "SELL"] },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model("User", userSchema);
const MongoPortfolio = mongoose.model("Portfolio", portfolioSchema);

// SQLite Fallback Driver
let sqliteDriver = null;
function getSqliteDriver() {
  if (sqliteDriver) return sqliteDriver;
  const { DatabaseSync } = require("node:sqlite");
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  const dbDir = isServerless ? "/tmp" : __dirname;
  const dbPath = path.join(dbDir, "stock_portfolio.sqlite");
  const sqlite = new DatabaseSync(dbPath);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS portfolio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      company_symbol TEXT NOT NULL,
      company_name TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      quantity REAL NOT NULL,
      price REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  sqliteDriver = sqlite;
  return sqliteDriver;
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 2000
})
.then(() => {
  isMongoConnected = true;
  console.log(`[Database] MongoDB Connected successfully to: ${MONGODB_URI}`);
})
.catch((err) => {
  isMongoConnected = false;
  console.log(`[Database] MongoDB not reachable at ${MONGODB_URI} (${err.message}).`);
  console.log("[Database] Active in-memory/SQLite database mode is ready.");
  getSqliteDriver();
});

// ---------------------- JWT Middleware ----------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// ---------------------- API Routes ----------------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    database: isMongoConnected ? "MongoDB" : "SQLite",
    timestamp: new Date().toISOString()
  });
});

// Register User
app.post(["/register", "/api/register"], async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMongoConnected) {
      const existing = await MongoUser.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      await MongoUser.create({ name: cleanName, email: cleanEmail, password: hashedPassword });
      return res.json({ message: "User registered successfully with MongoDB" });
    } else {
      const sqlite = getSqliteDriver();
      try {
        const stmt = sqlite.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        stmt.run(cleanName, cleanEmail, hashedPassword);
        return res.json({ message: "User registered successfully" });
      } catch (err) {
        if (err.message && err.message.includes("UNIQUE")) {
          return res.status(400).json({ message: "An account with this email already exists" });
        }
        return res.status(400).json({ message: "Registration failed. Email already registered." });
      }
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login User
app.post(["/login", "/api/login"], async (req, res) => {
  try {
    const identifier = (req.body.email || req.body.username || "").toLowerCase().trim();
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/Username and password are required" });
    }

    let user = null;

    if (isMongoConnected) {
      user = await MongoUser.findOne({
        $or: [{ email: identifier }, { name: new RegExp(`^${identifier}$`, "i") }]
      });
    } else {
      const sqlite = getSqliteDriver();
      const rows = sqlite.prepare("SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ?").all(identifier, identifier);
      if (rows.length > 0) user = rows[0];
    }

    if (!user) {
      return res.status(400).json({ message: "User not found. Please register first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = jwt.sign(
      { id: userId, name: user.name, email: user.email },
      SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: { id: userId, name: user.name, email: user.email },
      message: "Successfully logged in!"
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login server error" });
  }
});

// Add Stock Transaction
app.post(["/portfolio", "/api/portfolio"], authenticateToken, async (req, res) => {
  try {
    const { company_symbol, company_name, transaction_type, quantity, price } = req.body;
    if (!company_symbol || !company_name || !transaction_type || quantity === undefined || price === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const cleanSymbol = company_symbol.toUpperCase().trim();
    const cleanName = company_name.trim();
    const cleanType = transaction_type.toUpperCase().trim();
    const cleanQty = Number(quantity);
    const cleanPrice = Number(price);

    if (isNaN(cleanQty) || cleanQty <= 0 || isNaN(cleanPrice) || cleanPrice <= 0) {
      return res.status(400).json({ message: "Quantity and price must be positive numbers" });
    }

    if (isMongoConnected) {
      await MongoPortfolio.create({
        userId: req.user.id,
        companySymbol: cleanSymbol,
        companyName: cleanName,
        transactionType: cleanType,
        quantity: cleanQty,
        price: cleanPrice,
        date: new Date()
      });
    } else {
      const sqlite = getSqliteDriver();
      sqlite.prepare(
        `INSERT INTO portfolio (user_id, company_symbol, company_name, transaction_type, quantity, price, date)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      ).run(req.user.id, cleanSymbol, cleanName, cleanType, cleanQty, cleanPrice);
    }

    res.json({ message: "Stock transaction added successfully" });
  } catch (error) {
    console.error("Add transaction error:", error);
    res.status(500).json({ message: "Error recording transaction" });
  }
});

// Helper to fetch live real-time price
async function getLivePrice(symbol, defaultPrice) {
  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { timeout: 2000 }
    );
    if (response.data && response.data.c && response.data.c > 0) {
      return response.data.c;
    }
  } catch (e) {
    // Quietly fallback
  }
  return defaultPrice;
}

// Get All Transactions with Live Market Prices
app.get(["/portfolio", "/api/portfolio"], authenticateToken, async (req, res) => {
  try {
    let items = [];

    if (isMongoConnected) {
      const records = await MongoPortfolio.find({ userId: req.user.id }).sort({ date: -1 });
      items = records.map(r => ({
        id: r._id.toString(),
        company_name: r.companyName,
        company_symbol: r.companySymbol,
        transaction_type: r.transactionType,
        quantity: r.quantity,
        price: r.price,
        date: r.date
      }));
    } else {
      const sqlite = getSqliteDriver();
      const records = sqlite.prepare("SELECT * FROM portfolio WHERE user_id = ? ORDER BY date DESC").all(req.user.id);
      items = records.map(r => ({
        id: r.id,
        company_name: r.company_name,
        company_symbol: r.company_symbol,
        transaction_type: r.transaction_type,
        quantity: Number(r.quantity),
        price: Number(r.price),
        date: r.date
      }));
    }

    const updatedPortfolio = await Promise.all(
      items.map(async (stock) => {
        const current_price = await getLivePrice(stock.company_symbol, stock.price);
        const profitLoss = stock.transaction_type === "BUY"
          ? (current_price - stock.price) * stock.quantity
          : (stock.price - current_price) * stock.quantity;

        return {
          ...stock,
          current_price: Number(current_price),
          profitLoss: Number(profitLoss)
        };
      })
    );

    res.json(updatedPortfolio);
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({ message: "Error fetching portfolio" });
  }
});

// Delete Stock Transaction
app.delete(["/portfolio/:id", "/api/portfolio/:id"], authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      await MongoPortfolio.deleteOne({ _id: id, userId: req.user.id });
    } else {
      const sqlite = getSqliteDriver();
      sqlite.prepare("DELETE FROM portfolio WHERE id = ? AND user_id = ?").run(id, req.user.id);
    }

    res.json({ message: "Stock transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ message: "Error deleting transaction" });
  }
});

// ---------------------- Serve Client ----------------------
const clientDistPath = path.join(__dirname, "client", "dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  app.use(express.static(__dirname));
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "intro.html"));
  });
}

// ---------------------- Start Server ----------------------
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`Portfolio Server running on http://localhost:${PORT}`);
    console.log(`MongoDB URI configured: ${MONGODB_URI}`);
    console.log(`========================================`);
  });
}

module.exports = app;
