import express, { json } from "express"
import dotenv from "dotenv"
import cors from "cors"

import { userRouter } from "./routers/user.router.js"
import { vendorRouter } from "./routers/vendor.router.js"
import { customerRouter } from "./routers/customer.router.js"
import { invoiceRouter } from "./routers/invoice.router.js"
import { inventoryRouter } from "./routers/inventory.router.js"
import { jobCardRouter } from "./routers/job-card.router.js"

dotenv.config()

const app = express()

let port = process.env.PORT || 5013

app.use(express.static("public"))

app.use(express.urlencoded({ extended: true }))

app.use(express.json())

let corsOptions = {
    origin: "*",
    method: "*"
}

app.use(cors(corsOptions))

// routes

app.get("/test", (req, res) => { res.status(200).json({ message: "test ran successfully !" }) })

app.use("/user", userRouter)

app.use("/customer", customerRouter)

app.use("/vendor", vendorRouter)

app.use("/job-card", jobCardRouter)

app.use("/inventory", inventoryRouter)

app.use("/invoices", invoiceRouter)

// wild route
app.use((req, res) => {
    res.status(404).json({ message: "route/content not found !" })
})

app.listen(port, () => {
    console.log(`server is running on port ${port} !`)
})