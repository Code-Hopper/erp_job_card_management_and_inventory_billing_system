import express from "express";
import {
  createPurchase,
  listPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchase.controller.js";
import { authToken, requireRole } from "../middlewares/jwt.js";

const purchaseRoutes = express.Router();

purchaseRoutes.post("/create", authToken, requireRole("admin"), createPurchase);
purchaseRoutes.get("/list", authToken, requireRole("admin"), listPurchases);
purchaseRoutes.get("/id/:id", authToken, requireRole("admin"), getPurchaseById);
purchaseRoutes.put("/update/:id", authToken, requireRole("admin"), updatePurchase);
purchaseRoutes.delete("/delete/:id", authToken, requireRole("admin"), deletePurchase);

export default purchaseRoutes;
