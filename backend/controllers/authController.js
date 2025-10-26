import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const isGmail = /^[A-Za-z0-9._%+-]+@gmail\.com$/.test(username);
    if (!isGmail) {
      return res.status(400).json({ message: "Please use a valid Gmail address" });
    }
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({ message: "Password must be 8+ chars, include upper, lower, and number" });
    }
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, role: "user" });
    const token = jwt.sign(
      { sub: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "24h" } // Explicitly 24 hours
    );
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "24h" } // Explicitly 24 hours
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const validate = async (req, res) => {
  try {
    // If we reach here, the token is valid (ensureAuth middleware already validated it)
    res.json({ 
      valid: true, 
      user: req.user 
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const ensureAuth = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }
  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET || "dev_secret");
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


