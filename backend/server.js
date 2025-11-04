import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import quotationRoutes from "./routes/quotationRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { ensureAuth } from "./controllers/authController.js";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors(
    // {origin: process.env.FRONTEND_URL,
    // credentials: true,}
  )
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// MongoDB connection with TLS fix for Compass / Node.js
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true, // enable TLS
  tlsAllowInvalidCertificates: true, // allow self-signed / invalid certs (safe for dev only)
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log("❌ MongoDB connection error:", err));

// Seed default admin user if configured
async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;
  const existing = await User.findOne({ username });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash, role: "admin" });
    console.log(`🧩 Seeded admin user: ${username}`);
  }
}
seedAdmin().catch(console.error);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quotations", ensureAuth, quotationRoutes);
app.use("/api/customers", ensureAuth, customerRoutes);
app.use("/api/settings", ensureAuth, settingsRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
