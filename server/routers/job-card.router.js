import express from "express"
import {JobCardRouterTest} from "../controllers/job-card.controller.js"

export const jobCardRouter = express.Router()

jobCardRouter.get("/test",JobCardRouterTest)