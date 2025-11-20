import mongoose, { mongo } from "mongoose";

const DatesSchema = new mongoose.Schema({
    added: {
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date,
    }
}, { _id: false })

const inventoryScheam = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    vendorDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors',
        required: true
    },
    type: {
        type: String,
        enum: ["product", "service"],
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: 'pcs'
    },
    mrp: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    dates: {
        type: DatesSchema
    }
})

const InventoryModel = new mongoose.model("inventory", inventoryScheam)

export { InventoryModel }