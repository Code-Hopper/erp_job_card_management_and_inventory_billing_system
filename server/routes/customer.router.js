import express from "express";
import {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js";
import { authToken, requireRole } from "../middlewares/jwt.js";

const customerRoutes = express.Router();

customerRoutes.post("/create", authToken, createCustomer);
customerRoutes.get("/list", authToken, listCustomers);
customerRoutes.get("/id/:id", authToken, getCustomerById);
customerRoutes.put("/update/:id", authToken, requireRole("admin"), updateCustomer);
customerRoutes.delete("/delete/:id", authToken, requireRole("admin"), deleteCustomer);

export default customerRoutes;
