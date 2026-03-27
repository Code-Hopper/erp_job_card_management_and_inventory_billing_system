import express from "express";
import {
  loginUser,
  getMe,
  createTechnician,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authToken, requireRole } from "../middlewares/jwt.js";

const userRoutes = express.Router();

userRoutes.post("/login", loginUser);
userRoutes.get("/me", authToken, getMe);
userRoutes.post("/create", authToken, requireRole("admin"), createUser);
userRoutes.get("/list", authToken, requireRole("admin"), listUsers);
userRoutes.get("/id/:id", authToken, requireRole("admin"), getUserById);
userRoutes.put("/update/:id", authToken, requireRole("admin"), updateUser);
userRoutes.delete("/delete/:id", authToken, requireRole("admin"), deleteUser);
userRoutes.post(
  "/create/technician",
  authToken,
  requireRole("admin"),
  createTechnician
);

export default userRoutes;
