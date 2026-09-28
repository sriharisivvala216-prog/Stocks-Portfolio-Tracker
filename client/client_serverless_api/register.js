const connectDB = require("../backend/config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const storage = require("../backend/services/storage");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "71fbc7fd1de400996382ccf5c8038da93d31896d158e86cc6a75a47fec5da333a9405d68bbc80aefe5cf624a4dd5a5697dc810e45d23b3362afb2048dd065a23";

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

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await storage.findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await storage.createUser({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: (newUser._id || newUser.id).toString(), name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: (newUser._id || newUser.id).toString(),
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Register serverless function error:", error);
    return res.status(500).json({ message: error.message || "Server error during user registration" });
  }
};
