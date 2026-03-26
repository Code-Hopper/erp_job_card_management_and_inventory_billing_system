import express from "express";
import {
  loginUser,
  getMe,
  createTechnician,
} from "../controllers/user.controller.js";
import { authToken, requireRole } from "../middlewares/jwt.js";

const userRoutes = express.Router();

userRoutes.post("/login", loginUser);
userRoutes.get("/me", authToken, getMe);
userRoutes.post(
  "/create/technician",
  authToken,
  requireRole("admin"),
  createTechnician
);

export default userRoutes;
