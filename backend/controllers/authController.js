const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "71fbc7fd1de400996382ccf5c8038da93d31896d158e86cc6a75a47fec5da333a9405d68bbc80aefe5cf624a4dd5a5697dc810e45d23b3362afb2048dd065a23";

// @desc    Register a new user
// @route   POST /api/auth/register or /register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser._id.toString(), name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Register controller error:", error);
    res.status(500).json({ message: "Server error during user registration" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login or /login
const login = async (req, res) => {
  try {
    const identifier = (req.body.email || req.body.username || "").toLowerCase().trim();
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/Username and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { name: new RegExp(`^${identifier}$`, "i") }],
    });

    if (!user) {
      return res.status(400).json({ message: "User not found. Please register first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    const token = jwt.sign(
      { id: user._id.toString(), name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Successfully logged in!",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login controller error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("GetMe controller error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
