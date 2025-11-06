import express from "express";
import { getReferences, addReference } from "../controllers/referenceController.js";

const router = express.Router();
router.get("/", getReferences);
router.post("/", addReference);

export default router;
