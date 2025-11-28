import express from "express"
import {UserRouterTest} from "../controllers/user.controller.js"

export const userRouter = express.Router()

userRouter.get("/test",UserRouterTest)

// create route for admin login