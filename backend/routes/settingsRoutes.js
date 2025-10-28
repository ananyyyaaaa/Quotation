import express from "express";
import { getSettings, saveSettings } from "../controllers/settingsController.js";
import { ensureAuth } from "../controllers/authController.js";

const router = express.Router();

router.get("/", ensureAuth, getSettings);
router.post("/", ensureAuth, saveSettings);

export default router;


