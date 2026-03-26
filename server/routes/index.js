import express from "express"
import { getHealth } from "../controllers/healthController.js"
import userRoutes from "./user.router.js"
import customerRoutes from "./customer.router.js"
import supplierRoutes from "./supplier.router.js"

const routes = express.Router();

routes.get('/health', getHealth);
routes.use('/user', userRoutes);
routes.use('/customers', customerRoutes);
routes.use('/suppliers', supplierRoutes);

export default routes
