import express from "express";
import { getCustomers, addCustomer } from "../controllers/customerController.js";

const router = express.Router();

router.get("/", getCustomers);
router.post("/", addCustomer);

export default router;
