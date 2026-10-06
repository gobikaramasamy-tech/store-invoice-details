const Invoice = require("../models/Invoice");

/* =====================================================
   SAVE INVOICE
   POST /api/invoices
===================================================== */

const createInvoice = async (req, res) => {
    try {
        const {
            invoiceName,
            invoiceNumber,
            vendorName,
            vendorGST,
            invoiceDate,
            poNumber,
            currency,
            paymentTerms,
            subtotal,
            tax,
            discount,
            totalAmount,
            status,
            ocrAccuracy,
            duplicateProbability,
            calculationStatus,
            recommendation
        } = req.body;

        if (
            !invoiceName ||
            !invoiceNumber ||
            !vendorName ||
            !invoiceDate ||
            totalAmount === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required invoice details"
            });
        }

        /* Check duplicate invoice */

        const duplicate = await Invoice.findOne({
            invoiceNumber: invoiceNumber.trim()
        });

        let invoiceStatus = status || "Valid";

        if (duplicate) {
            invoiceStatus = "Duplicate";
        }

        const invoice = new Invoice({
            invoiceName: invoiceName.trim(),
            invoiceNumber: invoiceNumber.trim(),
            vendorName: vendorName.trim(),
            vendorGST: vendorGST || "",
            invoiceDate,
            poNumber: poNumber || "",
            currency: currency || "INR",
            paymentTerms: paymentTerms || "",
            subtotal: Number(subtotal) || 0,
            tax: Number(tax) || 0,
            discount: Number(discount) || 0,
            totalAmount: Number(totalAmount),
            status: invoiceStatus,
            ocrAccuracy: Number(ocrAccuracy) || 0,
            duplicateProbability:
                Number(duplicateProbability) || 0,
            calculationStatus:
                calculationStatus || "Pending",
            recommendation:
                recommendation || ""
        });

        await invoice.save();

        return res.status(201).json({
            success: true,
            message: "Invoice saved successfully",
            invoice: invoice
        });

    } catch (error) {
        console.error("CREATE INVOICE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save invoice"
        });
    }
};


/* =====================================================
   GET ALL INVOICES
   GET /api/invoices
===================================================== */

const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find()
            .sort({ uploadDate: -1 });

        return res.status(200).json({
            success: true,
            count: invoices.length,
            invoices: invoices
        });

    } catch (error) {
        console.error("GET INVOICES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch invoices"
        });
    }
};


/* =====================================================
   GET ONE INVOICE
   GET /api/invoices/:id
===================================================== */

const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        return res.status(200).json({
            success: true,
            invoice: invoice
        });

    } catch (error) {
        console.error("GET INVOICE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch invoice"
        });
    }
};


/* =====================================================
   DELETE INVOICE
   DELETE /api/invoices/:id
===================================================== */

const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(
            req.params.id
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Invoice deleted successfully"
        });

    } catch (error) {
        console.error("DELETE INVOICE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete invoice"
        });
    }
};


module.exports = {
    createInvoice,
    getInvoices,
    getInvoiceById,
    deleteInvoice
};