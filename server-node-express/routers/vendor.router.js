import express from "express"
import {VendorRouterTest} from "../controllers/vendor.controller.js"

export const vendorRouter = express.Router()

vendorRouter.get("/test",VendorRouterTest)