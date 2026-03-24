import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'customers', required: true },
    jobCards: [{ type: Schema.Types.ObjectId, ref: 'jobcards' }], // one or many
    items: [
        {
            name: String,
            inventoryItem: { type: Schema.Types.ObjectId, ref: 'Inventory' },
            qty: Number,
            unit: String,
            salePrice: Number,
            costPrice: Number,
            gstPercent: Number,
            amount: Number, // qty * salePrice
        }
    ],
    subtotal: Number,
    totalGst: Number,
    total: Number,
    status: { type: String, enum: ['unpaid', 'paid', 'pending'], default: 'unpaid' },
    payments: [
        {
            amount: Number,
            method: { type: String },
            paidAt: Date,
            reference: String,
            createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
        }
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now },
});

let InvoiceModel = new mongoose.model("invoices", InvoiceSchema)

export { InvoiceModel }