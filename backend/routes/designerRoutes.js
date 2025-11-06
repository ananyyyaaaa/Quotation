import express from "express";
import { getDesigners, addDesigner } from "../controllers/designerController.js";

const router = express.Router();
router.get("/", getDesigners);
router.post("/", addDesigner);

export default router;
