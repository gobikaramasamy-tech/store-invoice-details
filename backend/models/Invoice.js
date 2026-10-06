/* =====================================================
   AI INVOICE CHECKER
   INVOICE MODEL
===================================================== */

const mongoose = require("mongoose");


const invoiceSchema = new mongoose.Schema({

    invoiceName: {
        type: String,
        required: true,
        trim: true
    },

    invoiceNumber: {
        type: String,
        trim: true
    },

    vendorName: {
        type: String,
        trim: true
    },

    vendorGST: {
        type: String,
        trim: true
    },

    invoiceDate: {
        type: Date
    },

    poNumber: {
        type: String,
        trim: true
    },

    currency: {
        type: String,
        default: "INR"
    },

    paymentTerms: {
        type: String
    },

    subtotal: {
        type: Number,
        default: 0
    },

    tax: {
        type: Number,
        default: 0
    },

    discount: {
        type: Number,
        default: 0
    },

    totalAmount: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        default: "Needs Review"
    },

    ocrAccuracy: {
        type: Number,
        default: 0
    },

    duplicateProbability: {
        type: Number,
        default: 0
    },

    calculationStatus: {
        type: String,
        default: "Pending"
    },

    recommendation: {
        type: String,
        default: ""
    },

    uploadDate: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});


module.exports =
    mongoose.model(
        "Invoice",
        invoiceSchema
    );