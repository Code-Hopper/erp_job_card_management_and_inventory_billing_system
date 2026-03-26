import express from "express";
import {
  createSupplier,
  listSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplier.controller.js";
import { authToken, requireRole } from "../middlewares/jwt.js";

const supplierRoutes = express.Router();

supplierRoutes.post("/create", authToken, createSupplier);
supplierRoutes.get("/list", authToken, listSuppliers);
supplierRoutes.get("/id/:id", authToken, getSupplierById);
supplierRoutes.put("/update/:id", authToken, requireRole("admin"), updateSupplier);
supplierRoutes.delete("/delete/:id", authToken, requireRole("admin"), deleteSupplier);

export default supplierRoutes;
