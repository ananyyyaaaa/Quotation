import express from "express";
import { generatePDF } from "../controllers/pdfController.js";
import { ensureAuth } from "../controllers/authController.js";

const router = express.Router();

// PDF generation route (protected)
router.post("/generate", ensureAuth, generatePDF);

export default router;

