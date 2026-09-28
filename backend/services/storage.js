const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");

// File-based persistence directory
const isCloud = !!(process.env.RENDER || process.env.VERCEL);
const dataDir = isCloud ? "/tmp" : path.join(__dirname, "..", "data");
const storePath = path.join(dataDir, "store.json");

function ensureStore() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(storePath)) {
      fs.writeFileSync(storePath, JSON.stringify({ users: [], portfolio: [] }, null, 2), "utf8");
    }
  } catch (err) {
    console.warn("[Storage] Warning initializing store:", err.message);
  }
}

ensureStore();

function readStore() {
  try {
    ensureStore();
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, "utf8"));
    }
  } catch (err) {
    // fallback
  }
  return { users: [], portfolio: [] };
}

function writeStore(data) {
  try {
    ensureStore();
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("[Storage] Error writing store:", err.message);
  }
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// ----------------- User Methods -----------------
async function findUserByEmail(email) {
  const cleanEmail = (email || "").toLowerCase().trim();
  if (isDbConnected()) {
    try {
      return await User.findOne({ email: cleanEmail });
    } catch (e) {
      console.warn("[Storage] MongoDB query fallback to store:", e.message);
    }
  }
  const store = readStore();
  const user = store.users.find((u) => u.email === cleanEmail);
  return user ? { ...user, _id: user._id || user.id, id: user._id || user.id } : null;
}

async function findUserByIdentifier(identifier) {
  const clean = (identifier || "").toLowerCase().trim();
  if (isDbConnected()) {
    try {
      return await User.findOne({
        $or: [{ email: clean }, { name: new RegExp(`^${clean}$`, "i") }],
      });
    } catch (e) {
      console.warn("[Storage] MongoDB query fallback to store:", e.message);
    }
  }
  const store = readStore();
  const user = store.users.find(
    (u) => (u.email && u.email.toLowerCase() === clean) || (u.name && u.name.toLowerCase() === clean)
  );
  return user ? { ...user, _id: user._id || user.id, id: user._id || user.id } : null;
}

async function findUserById(id) {
  if (isDbConnected()) {
    try {
      return await User.findById(id).select("-password");
    } catch (e) {
      console.warn("[Storage] MongoDB query fallback to store:", e.message);
    }
  }
  const store = readStore();
  const user = store.users.find((u) => u._id === id || u.id === id);
  if (!user) return null;
  const { password, ...safeUser } = user;
  return { ...safeUser, _id: user._id || user.id, id: user._id || user.id };
}

async function createUser({ name, email, password }) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name.trim();

  if (isDbConnected()) {
    try {
      const newUser = await User.create({
        name: cleanName,
        email: cleanEmail,
        password,
      });
      return {
        _id: newUser._id.toString(),
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
      };
    } catch (e) {
      console.warn("[Storage] MongoDB create failed, writing to local store:", e.message);
    }
  }

  const store = readStore();
  const newId = new mongoose.Types.ObjectId().toString();
  const newUser = {
    _id: newId,
    id: newId,
    name: cleanName,
    email: cleanEmail,
    password,
    createdAt: new Date().toISOString(),
  };

  store.users.push(newUser);
  writeStore(store);

  return {
    _id: newId,
    id: newId,
    name: cleanName,
    email: cleanEmail,
  };
}

// ----------------- Portfolio Methods -----------------
async function createPortfolio({ userId, companySymbol, companyName, transactionType, quantity, price }) {
  if (isDbConnected()) {
    try {
      const record = await Portfolio.create({
        userId,
        companySymbol,
        companyName,
        transactionType,
        quantity,
        price,
        date: new Date(),
      });
      return {
        _id: record._id.toString(),
        id: record._id.toString(),
        companySymbol: record.companySymbol,
        companyName: record.companyName,
        transactionType: record.transactionType,
        quantity: record.quantity,
        price: record.price,
        date: record.date,
      };
    } catch (e) {
      console.warn("[Storage] MongoDB portfolio create failed, writing to local store:", e.message);
    }
  }

  const store = readStore();
  const newId = new mongoose.Types.ObjectId().toString();
  const newRecord = {
    _id: newId,
    id: newId,
    userId: String(userId),
    companySymbol,
    companyName,
    transactionType,
    quantity,
    price,
    date: new Date().toISOString(),
  };

  store.portfolio.push(newRecord);
  writeStore(store);

  return newRecord;
}

async function getPortfolio(userId) {
  const uId = String(userId);
  if (isDbConnected()) {
    try {
      const records = await Portfolio.find({ userId: uId }).sort({ date: -1 });
      return records.map((r) => ({
        id: r._id.toString(),
        company_name: r.companyName,
        company_symbol: r.companySymbol,
        transaction_type: r.transactionType,
        quantity: Number(r.quantity),
        price: Number(r.price),
        date: r.date,
      }));
    } catch (e) {
      console.warn("[Storage] MongoDB portfolio get failed, reading store:", e.message);
    }
  }

  const store = readStore();
  const records = store.portfolio
    .filter((p) => String(p.userId) === uId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return records.map((r) => ({
    id: r._id || r.id,
    company_name: r.companyName,
    company_symbol: r.companySymbol,
    transaction_type: r.transactionType,
    quantity: Number(r.quantity),
    price: Number(r.price),
    date: r.date,
  }));
}

async function deletePortfolio(id, userId) {
  const uId = String(userId);
  if (isDbConnected()) {
    try {
      const result = await Portfolio.findOneAndDelete({ _id: id, userId: uId });
      return !!result;
    } catch (e) {
      console.warn("[Storage] MongoDB delete failed, falling back to store:", e.message);
    }
  }

  const store = readStore();
  const initLen = store.portfolio.length;
  store.portfolio = store.portfolio.filter((p) => !((p._id === id || p.id === id) && String(p.userId) === uId));

  if (store.portfolio.length !== initLen) {
    writeStore(store);
    return true;
  }
  return false;
}

module.exports = {
  isDbConnected,
  findUserByEmail,
  findUserByIdentifier,
  findUserById,
  createUser,
  createPortfolio,
  getPortfolio,
  deletePortfolio,
};
