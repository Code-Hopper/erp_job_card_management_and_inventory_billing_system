import express from "express"
import { getHealth } from "../controllers/healthController.js"

const routes = express.Router();

routes.get('/health', getHealth);

export default routes