import mongoose, { mongo } from "mongoose";

const DatesSchema = new mongoose.Schema({
    created: {
        type: String,
        default: Date.now()
    },
    updated: {
        type: String,
        required: false
    },
    billed: {
        type: String,
        required: false
    },
    closed: {
        type: String,
        required: false
    }
}, { _id: false })

const DeviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    discription: {
        type: String,
        required: true
    },
    condition: {
        type: String,
        required: true
    }
}, { _id: false })

const billSchema = mongoose.Schema({
    entity: {
        // product/service
        type: mongoose.Schema.ObjectId,
        ref: "inventory",
        required: true
    },
    selling_price: {
        type: Number,
        required: true
    },
    qty: {
        type: Number,
        required: true
    }
}, { _id: false })

const JobCardSchema = mongoose.Schema({
    title: {
        type: String
    },
    dates: {
        type: Object,
        default: DatesSchema,
        required: true
    },
    forCustomer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customers' // 'User' refers to the Mongoose model named 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'closed'],
        default: "open"
    },
    billingStatus: {
        type: String,
        enum: ['not billed', 'billed', 'paid', 'pending'],
        default: "not billed"
    },
    devices: {
        type: [DeviceSchema],
        required: true
    },
    invoice: {
        type: [billSchema],
        default: []
    }
})

const JobCardModel = new mongoose.model("jobcards", JobCardSchema)

export { JobCardModel }