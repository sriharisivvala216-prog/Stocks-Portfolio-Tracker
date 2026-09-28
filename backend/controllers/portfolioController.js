const axios = require("axios");
const storage = require("../services/storage");

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "d302t41r01qnmrscnpa0d302t41r01qnmrscnpag";

// In-memory quote cache to optimize Finnhub rate limits (10-second TTL)
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
    // Graceful fallback to default purchase price
  }
  return Number(defaultPrice);
}

// @desc    Add a stock transaction
// @route   POST /api/portfolio or /portfolio
const addTransaction = async (req, res) => {
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
      userId: req.user.id,
      companySymbol: cleanSymbol,
      companyName: cleanName,
      transactionType: cleanType,
      quantity: cleanQty,
      price: cleanPrice,
    });

    res.status(201).json({
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
    res.status(500).json({ message: "Error recording transaction" });
  }
};

// @desc    Get all transactions for the authenticated user with live market prices
// @route   GET /api/portfolio or /portfolio
const getPortfolio = async (req, res) => {
  try {
    const formattedItems = await storage.getPortfolio(req.user.id);

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

    res.json(enrichedPortfolio);
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({ message: "Error fetching portfolio" });
  }
};

// @desc    Delete a stock transaction
// @route   DELETE /api/portfolio/:id or /portfolio/:id
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const success = await storage.deletePortfolio(id, req.user.id);

    if (!success) {
      return res.status(404).json({ message: "Transaction not found or unauthorized" });
    }

    res.json({ message: "Stock transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ message: "Error deleting transaction" });
  }
};

module.exports = {
  addTransaction,
  getPortfolio,
  deleteTransaction,
};
