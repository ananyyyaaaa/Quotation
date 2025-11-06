import express from "express";
import { getManagers, addManager } from "../controllers/managerController.js";

const router = express.Router();
router.get("/", getManagers);
router.post("/", addManager);

export default router;
