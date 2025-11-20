import express from "express"
import { InventoryRouterTest } from "../controllers/inventory.controller.js"

export const inventoryRouter = express.Router()

inventoryRouter.get("/test", InventoryRouterTest)