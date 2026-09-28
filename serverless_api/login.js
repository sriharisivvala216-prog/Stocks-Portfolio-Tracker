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
    const { email, username, password } = req.body || {};
    const identifier = (email || username || "").toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/Username and password are required" });
    }

    const user = await storage.findUserByIdentifier(identifier);
    if (!user) {
      return res.status(400).json({ message: "User not found. Please register first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    const token = jwt.sign(
      { id: (user._id || user.id).toString(), name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Successfully logged in!",
      token,
      user: {
        id: (user._id || user.id).toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login serverless function error:", error);
    return res.status(500).json({ message: error.message || "Server error during login" });
  }
};
