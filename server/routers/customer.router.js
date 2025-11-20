import express from "express"
import { CustomerRouterTest } from "../controllers/customer.controller.js"

export const customerRouter = express.Router()

customerRouter.get("/test", CustomerRouterTest)