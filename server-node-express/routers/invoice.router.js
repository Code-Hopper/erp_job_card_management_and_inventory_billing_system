import express from "express"
import { InvoiceRouterTest } from "../controllers/invoice.controller.js"

export const invoiceRouter = express.Router()

invoiceRouter.get("/test", InvoiceRouterTest)