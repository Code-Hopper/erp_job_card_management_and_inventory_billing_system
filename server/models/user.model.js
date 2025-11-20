import mongoose, { Mongoose } from "mongoose";
import bcrypt from "bcrypt"

let EmailSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    verifed: {
        type: Boolean,
        default: false
    }
}, { _id: false })

const UserAddressSchema = mongoose.Schema({
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

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: EmailSchema,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: UserAddressSchema,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    access: {
        type: [String],
        default: ["job-card", "invoice", "customer", "billing", "account"],
        enum: ["job-card", "invoice", "customer", "billing", "account"]
    },
    role: {
        type: String,
        enum: ["technician", "manager"]
    },
    password: {
        type: String,
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now(),
    },
    createdJobCards: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'jobcards'
    }
})

userSchema.pre('save', async function () {
    try {

        this.password = await bcrypt.hash(this.password, 12)

    } catch (err) {
        console.log("error before user save : ", err)
    }
})

const UserModel = new mongoose.model("users", userSchema)

export { UserModel }