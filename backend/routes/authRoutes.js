import express from "express";
import { login, register, validate, ensureAuth } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/validate", ensureAuth, validate);

export default router;


