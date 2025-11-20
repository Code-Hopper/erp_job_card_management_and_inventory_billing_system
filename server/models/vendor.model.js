import mongoose from "mongoose"

const VendorAddressSchema = new mongoose.Schema({
    house: {
        type: String,
        require: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        default: "India"
    },
    pincode: {
        type: String,
        required: true
    }
}, { _id: false })

const VendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    address: {
        type: VendorAddressSchema,
        required: true
    },
    type: {
        type: String,
        enum: ["retail", "business"],
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    gstn: {
        type: String
    },
    registeredAt: {
        type: Date,
        default: Date.now()
    }
})

const VendorModel = new mongoose.model("vendors", VendorSchema)

export { VendorModel }