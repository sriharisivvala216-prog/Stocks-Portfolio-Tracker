const connectDB = require("../backend/config/db");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const storage = require("../backend/services/storage");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "71fbc7fd1de400996382ccf5c8038da93d31896d158e86cc6a75a47fec5da333a9405d68bbc80aefe5cf624a4dd5a5697dc810e45d23b3362afb2048dd065a23";
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "d302t41r01qnmrscnpa0d302t41r01qnmrscnpag";

const quoteCache = new Map();

async function getLivePrice(symbol, defaultPrice) {
  const cached = quoteCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < 10000) {
    return cached.price;
  }

  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`,
      { timeout: 2500 }
    );
    if (response.data && response.data.c && response.data.c > 0) {
      const price = Number(response.data.c);
      quoteCache.set(symbol, { price, timestamp: Date.now() });
      return price;
    }
  } catch (err) {
    // Fallback to purchase price
  }
  return Number(defaultPrice);
}

const authenticate = (req) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const user = authenticate(req);
  if (!user) {
    return res.status(401).json({ message: "Access denied. Valid authentication token required." });
  }

  await connectDB();

  // POST: Add transaction
  if (req.method === "POST") {
    try {
      const { company_symbol, company_name, transaction_type, quantity, price } = req.body || {};
      if (!company_symbol || !company_name || !transaction_type || quantity === undefined || price === undefined) {
        return res.status(400).json({ message: "All transaction fields are required" });
      }

      const cleanSymbol = company_symbol.toUpperCase().trim();
      const cleanName = company_name.trim();
      const cleanType = transaction_type.toUpperCase().trim();
      const cleanQty = Number(quantity);
      const cleanPrice = Number(price);

      if (isNaN(cleanQty) || cleanQty <= 0 || isNaN(cleanPrice) || cleanPrice <= 0) {
        return res.status(400).json({ message: "Quantity and price must be positive numbers" });
      }

      const transaction = await storage.createPortfolio({
        userId: user.id,
        companySymbol: cleanSymbol,
        companyName: cleanName,
        transactionType: cleanType,
        quantity: cleanQty,
        price: cleanPrice,
      });

      return res.status(201).json({
        message: "Stock transaction added successfully",
        transaction: {
          id: transaction._id || transaction.id,
          company_symbol: transaction.companySymbol,
          company_name: transaction.companyName,
          transaction_type: transaction.transactionType,
          quantity: transaction.quantity,
          price: transaction.price,
          date: transaction.date,
        },
      });
    } catch (error) {
      console.error("Add transaction error:", error);
      return res.status(500).json({ message: error.message || "Error saving transaction to database" });
    }
  }

  // GET: Fetch user portfolio
  if (req.method === "GET") {
    try {
      const formattedItems = await storage.getPortfolio(user.id);

      const enrichedPortfolio = await Promise.all(
        formattedItems.map(async (stock) => {
          const current_price = await getLivePrice(stock.company_symbol, stock.price);
          const profitLoss =
            stock.transaction_type === "BUY"
              ? (current_price - stock.price) * stock.quantity
              : (stock.price - current_price) * stock.quantity;

          return {
            ...stock,
            current_price: Number(current_price.toFixed(2)),
            profitLoss: Number(profitLoss.toFixed(2)),
          };
        })
      );

      return res.status(200).json(enrichedPortfolio);
    } catch (error) {
      console.error("Get portfolio error:", error);
      return res.status(500).json({ message: error.message || "Error fetching portfolio" });
    }
  }

  // DELETE: Delete transaction
  if (req.method === "DELETE") {
    try {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ message: "Transaction ID is required for deletion" });
      }

      const success = await storage.deletePortfolio(id, user.id);

      if (!success) {
        return res.status(404).json({ message: "Transaction not found or unauthorized" });
      }

      return res.status(200).json({ message: "Stock transaction deleted successfully" });
    } catch (error) {
      console.error("Delete transaction error:", error);
      return res.status(500).json({ message: error.message || "Error deleting transaction" });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
};
