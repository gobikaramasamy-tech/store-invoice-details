
const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");

const Invoice = require("../models/Invoice");

const router = express.Router();


// ======================================================
// MULTER CONFIGURATION
// ======================================================

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, callback) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg"
        ];

        if (!allowedTypes.includes(file.mimetype)) {

            return callback(
                new Error(
                    "Only JPG, JPEG and PNG files are supported."
                )
            );

        }

        callback(null, true);

    }
});


// ======================================================
// HELPER FUNCTIONS
// ======================================================


// Convert text amount into a number

function cleanAmount(value) {

    if (value === undefined || value === null) {
        return 0;
    }

    let cleanedValue = String(value)
        .replace(/[^\d.,-]/g, "")
        .trim();

    if (!cleanedValue) {
        return 0;
    }

    // Handle formats such as 1,234.56

    if (
        cleanedValue.includes(",") &&
        cleanedValue.includes(".")
    ) {

        cleanedValue = cleanedValue.replace(/,/g, "");

    }

    // Handle formats such as 1234,56

    else if (
        cleanedValue.includes(",") &&
        !cleanedValue.includes(".")
    ) {

        const commaParts = cleanedValue.split(",");

        if (
            commaParts.length === 2 &&
            commaParts[1].length === 2
        ) {

            cleanedValue = cleanedValue.replace(",", ".");

        } else {

            cleanedValue = cleanedValue.replace(/,/g, "");

        }

    }

    return Number.parseFloat(cleanedValue) || 0;

}


// Normalize text for comparison

function normalizeText(value) {

    return String(value || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

}


// Escape special regex characters

function escapeRegex(value) {

    return String(value || "")
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

}


// Check whether a value is missing

function isMissing(value) {

    if (value === null || value === undefined) {
        return true;
    }

    const text = String(value).trim().toLowerCase();

    return (
        text === "" ||
        text === "not detected" ||
        text === "not available" ||
        text === "unknown"
    );

}


// Check whether a date is valid

function isValidDate(date) {

    return (
        date instanceof Date &&
        !Number.isNaN(date.getTime())
    );

}


// ======================================================
// DATE EXTRACTION
// ======================================================


// Parse a date from common invoice formats

function parseInvoiceDate(value) {

    if (!value) {
        return null;
    }

    const cleanedValue = String(value)
        .replace(/\s+/g, "")
        .trim();

    const match = cleanedValue.match(
        /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/
    );

    if (!match) {
        return null;
    }

    const first = Number.parseInt(match[1], 10);
    const second = Number.parseInt(match[2], 10);
    const year = Number.parseInt(match[3], 10);

    let day;
    let month;

    /*
       If the first number is greater than 12,
       it must be the day.

       Otherwise, we use the common US format:
       MM/DD/YYYY.

       Ambiguous dates should still be reviewed
       when necessary.
    */

    if (first > 12 && second <= 12) {

        day = first;
        month = second;

    } else {

        month = first;
        day = second;

    }

    const date = new Date(
        Date.UTC(year, month - 1, day)
    );

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {

        return null;

    }

    return date;

}


// Extract a date from multiple common labels

function extractInvoiceDate(text) {

    const datePattern =
        "(\\d{1,2}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{4})";

    const patterns = [

        new RegExp(
            "(?:invoice\\s*date|bill\\s*date|date\\s*of\\s*invoice)" +
            "\\s*[:\\-]?\\s*" +
            datePattern,
            "i"
        ),

        new RegExp(
            "\\bdate\\s*[:\\-]?\\s*" +
            datePattern,
            "i"
        )

    ];

    for (const pattern of patterns) {

        const match = text.match(pattern);

        if (match) {

            const date = parseInvoiceDate(match[1]);

            if (date) {
                return date;
            }

        }

    }

    return null;

}


// ======================================================
// INVOICE NUMBER
// ======================================================

function extractInvoiceNumber(text) {

    const patterns = [

        /invoice\s*(?:number|no\.?|#)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]*)/i,

        /bill\s*(?:number|no\.?|#)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]*)/i,

        /reference\s*(?:number|no\.?|#)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]*)/i

    ];

    for (const pattern of patterns) {

        const match = text.match(pattern);

        if (match) {

            return match[1]
                .trim()
                .replace(/[.,:;]+$/, "");

        }

    }

    return "";

}


// ======================================================
// VENDOR NAME
// ======================================================


// Extract vendor name conservatively.
// Avoid treating random OCR text as a vendor.

function extractVendorName(text) {

    const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const excludedWords = [

        "invoice",
        "bill",
        "date",
        "number",
        "invoice number",
        "invoice no",
        "invoice date",
        "subtotal",
        "total",
        "tax",
        "sales tax",
        "amount",
        "payment",
        "description",
        "quantity",
        "unit price",
        "po",
        "purchase order",
        "address",
        "phone",
        "email",
        "gst",
        "vat"

    ];

    for (const line of lines.slice(0, 12)) {

        const normalizedLine = normalizeText(line);

        if (!normalizedLine) {
            continue;
        }

        if (normalizedLine.length < 3) {
            continue;
        }

        if (excludedWords.some(word =>
            normalizedLine === word ||
            normalizedLine.startsWith(word + ":")
        )) {

            continue;

        }

        // Skip lines that are mostly numbers

        const letters = (line.match(/[A-Za-z]/g) || []).length;
        const numbers = (line.match(/\d/g) || []).length;

        if (letters < 3) {
            continue;
        }

        if (numbers > letters * 2) {
            continue;
        }

        // Avoid treating common invoice headings as vendor names

        if (
            normalizedLine.includes("invoice") ||
            normalizedLine.includes("subtotal") ||
            normalizedLine.includes("total due") ||
            normalizedLine.includes("payment is due")
        ) {

            continue;

        }

        return line
            .replace(/[|]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    }

    return "";

}


// ======================================================
// PO NUMBER
// ======================================================

function extractPONumber(text) {

    const patterns = [

        /p\.?\s*o\.?\s*(?:number|no\.?|#)?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]*)/i,

        /purchase\s*order\s*(?:number|no\.?|#)?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]*)/i

    ];

    for (const pattern of patterns) {

        const match = text.match(pattern);

        if (match) {

            return match[1]
                .trim()
                .replace(/[.,:;]+$/, "");

        }

    }

    return "";

}


// ======================================================
// AMOUNT EXTRACTION
// ======================================================


// Extract an amount appearing after a label

function extractAmountAfterLabel(text, labels) {

    for (const label of labels) {

        const pattern = new RegExp(
            label +
            "\\s*[:\\-]?\\s*" +
            "(?:USD|INR|EUR|GBP|[$₹€£])?" +
            "\\s*([0-9][0-9,]*(?:\\.\\d{1,2})?)",
            "i"
        );

        const match = text.match(pattern);

        if (match) {

            return cleanAmount(match[1]);

        }

    }

    return 0;

}


// Extract subtotal

function extractSubtotal(text) {

    return extractAmountAfterLabel(text, [

        "sub\\s*total",
        "net\\s*amount",
        "taxable\\s*amount"

    ]);

}


// Extract tax

function extractTax(text) {

    return extractAmountAfterLabel(text, [

        "sales\\s*tax",
        "tax",
        "vat",
        "gst",
        "cgst",
        "sgst",
        "igst"

    ]);

}


// Extract discount

function extractDiscount(text) {

    return extractAmountAfterLabel(text, [

        "discount"

    ]);

}


// Extract total

function extractTotal(text) {

    return extractAmountAfterLabel(text, [

        "grand\\s*total",
        "total\\s*amount",
        "amount\\s*due",
        "balance\\s*due",
        "\\btotal\\b"

    ]);

}


// ======================================================
// PAYMENT TERMS
// ======================================================

function extractPaymentTerms(text) {

    const patterns = [

        /payment\s+is\s+due\s+within\s+(\d+)\s+days/i,

        /due\s+within\s+(\d+)\s+days/i,

        /net\s+(\d+)/i

    ];

    for (const pattern of patterns) {

        const match = text.match(pattern);

        if (match) {

            return `${match[1]} Days`;

        }

    }

    return "";

}


// ======================================================
// CURRENCY
// ======================================================

function extractCurrency(text) {

    const upperText = String(text || "").toUpperCase();

    if (
        text.includes("₹") ||
        upperText.includes("INR") ||
        upperText.includes("RS.")
    ) {

        return "INR";

    }

    if (
        text.includes("€") ||
        upperText.includes("EUR")
    ) {

        return "EUR";

    }

    if (
        text.includes("£") ||
        upperText.includes("GBP")
    ) {

        return "GBP";

    }

    if (
        text.includes("$") ||
        upperText.includes("USD")
    ) {

        return "USD";

    }

    return "Unknown";

}


// ======================================================
// INVOICE DOCUMENT DETECTION
// ======================================================


// Check whether OCR text looks like an invoice

function looksLikeInvoice(text) {

    const normalizedText = normalizeText(text);

    const invoiceKeywords = [

        "invoice",
        "bill to",
        "invoice number",
        "invoice no",
        "subtotal",
        "grand total",
        "amount due",
        "payment terms",
        "sales tax",
        "purchase order",
        "p.o."

    ];

    const keywordCount = invoiceKeywords.filter(keyword =>
        normalizedText.includes(keyword)
    ).length;

    const hasAmount = /\d+[.,]\d{2}/.test(text);

    return keywordCount >= 1 && hasAmount;

}


// ======================================================
// CALCULATION VALIDATION
// ======================================================

function validateCalculation(
    subtotal,
    tax,
    discount,
    totalAmount
) {

    const hasRequiredAmounts =
        subtotal > 0 &&
        totalAmount > 0;

    if (!hasRequiredAmounts) {

        return {
            status: "Not Verified",
            correct: false,
            verified: false
        };

    }

    const calculatedTotal =
        subtotal + tax - discount;

    const difference =
        Math.abs(calculatedTotal - totalAmount);

    const correct =
        difference <= 0.05;

    return {
        status: correct ? "Correct" : "Incorrect",
        correct,
        verified: true
    };

}


// ======================================================
// DUPLICATE CHECK
// ======================================================

async function findDuplicateInvoice(invoiceData) {

    const invoiceNumber = normalizeText(
        invoiceData.invoiceNumber
    );

    const vendorName = normalizeText(
        invoiceData.vendorName
    );

    const totalAmount = Number(
        invoiceData.totalAmount
    ) || 0;

    if (
        !invoiceNumber ||
        invoiceNumber === "not detected" ||
        !vendorName ||
        vendorName === "not detected" ||
        totalAmount <= 0
    ) {

        return null;

    }

    const possibleInvoices = await Invoice.find({

        totalAmount: totalAmount,

        invoiceNumber: {
            $regex: `^${escapeRegex(invoiceNumber)}$`,
            $options: "i"
        }

    }).limit(20);

    const duplicate = possibleInvoices.find(invoice => {

        const savedVendor = normalizeText(
            invoice.vendorName
        );

        return savedVendor === vendorName;

    });

    return duplicate || null;

}


// ======================================================
// UPLOAD + OCR
// ======================================================

router.post(
    "/upload",
    upload.single("invoice"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please upload an invoice image."

                });

            }


            console.log("-----------------------------------------");
            console.log("INVOICE FILE RECEIVED");
            console.log("File:", req.file.originalname);
            console.log("Type:", req.file.mimetype);
            console.log("Size:", req.file.size);
            console.log("-----------------------------------------");


            console.log("Starting OCR...");


            const result = await Tesseract.recognize(

                req.file.buffer,

                "eng",

                {

                    logger: function (info) {

                        if (
                            info.status === "recognizing text"
                        ) {

                            console.log(
                                `OCR Progress: ${Math.round(
                                    info.progress * 100
                                )}%`
                            );

                        }

                    }

                }

            );


            const extractedText =
                result.data.text || "";

            const ocrAccuracy = Math.round(
                Number(result.data.confidence) || 0
            );


            console.log("-----------------------------------------");
            console.log("OCR COMPLETED");
            console.log("OCR Accuracy:", ocrAccuracy);
            console.log("OCR Text:");
            console.log(extractedText);
            console.log("-----------------------------------------");


            // ==================================================
            // EXTRACT FIELDS
            // ==================================================

            const invoiceNumber =
                extractInvoiceNumber(extractedText);

            const vendorName =
                extractVendorName(extractedText);

            const invoiceDate =
                extractInvoiceDate(extractedText);

            const poNumber =
                extractPONumber(extractedText);

            const subtotal =
                extractSubtotal(extractedText);

            const tax =
                extractTax(extractedText);

            const discount =
                extractDiscount(extractedText);

            const totalAmount =
                extractTotal(extractedText);

            const paymentTerms =
                extractPaymentTerms(extractedText);

            const currency =
                extractCurrency(extractedText);


            // ==================================================
            // DOCUMENT CHECK
            // ==================================================

            const invoiceDocument =
                looksLikeInvoice(extractedText);


            // ==================================================
            // CALCULATION CHECK
            // ==================================================

            const calculation =
                validateCalculation(
                    subtotal,
                    tax,
                    discount,
                    totalAmount
                );


            // ==================================================
            // REQUIRED FIELD CHECK
            // ==================================================

            const missingRequiredFields =

                !invoiceNumber ||
                !vendorName ||
                !invoiceDate ||
                totalAmount <= 0;


            // ==================================================
            // FINAL STATUS
            // ==================================================

            let invoiceStatus;
            let recommendation;

            if (!invoiceDocument) {

                invoiceStatus = "Needs Review";

                recommendation =
                    "The uploaded file does not appear to be a readable invoice. Please upload a clear invoice image.";

            }

            else if (ocrAccuracy < 50) {

                invoiceStatus = "Needs Review";

                recommendation =
                    "OCR confidence is low. Please upload a clearer invoice image.";

            }

            else if (missingRequiredFields) {

                invoiceStatus = "Needs Review";

                recommendation =
                    "Important invoice information is missing. Please review the extracted fields.";

            }

            else if (!calculation.verified) {

                invoiceStatus = "Needs Review";

                recommendation =
                    "Invoice amounts could not be verified.";

            }

            else if (!calculation.correct) {

                invoiceStatus = "Needs Review";

                recommendation =
                    "Invoice calculation does not match. Please review the amounts.";

            }

            else {

                invoiceStatus = "Valid";

                recommendation =
                    "Invoice information and calculations passed the initial checks.";

            }


            // ==================================================
            // INVOICE DATA
            // ==================================================

            const invoiceData = {

                invoiceName:
                    req.file.originalname,

                invoiceNumber:
                    invoiceNumber || "Not detected",

                vendorName:
                    vendorName || "Not detected",

                vendorGST:
                    "Not available",

                invoiceDate:
                    invoiceDate,

                poNumber:
                    poNumber || "Not detected",

                currency:
                    currency,

                paymentTerms:
                    paymentTerms || "Not detected",

                subtotal:
                    subtotal,

                tax:
                    tax,

                discount:
                    discount,

                totalAmount:
                    totalAmount,

                status:
                    invoiceStatus,

                ocrAccuracy:
                    ocrAccuracy,

                duplicateProbability:
                    0,

                calculationStatus:
                    calculation.status,

                recommendation:
                    recommendation,

                uploadDate:
                    new Date()

            };


            // ==================================================
            // DUPLICATE CHECK
            // ==================================================

            const duplicateInvoice =
                await findDuplicateInvoice(invoiceData);


            if (duplicateInvoice) {

                console.log("-----------------------------------------");
                console.log("DUPLICATE INVOICE DETECTED");
                console.log(
                    "Existing ID:",
                    duplicateInvoice._id
                );
                console.log("-----------------------------------------");


                return res.status(200).json({

                    success: true,

                    duplicate: true,

                    message:
                        "This invoice already exists in the database.",

                    invoice:
                        duplicateInvoice,

                    ocrText:
                        extractedText

                });

            }


            // ==================================================
            // SAVE TO MONGODB
            // ==================================================

            const savedInvoice =
                await Invoice.create(invoiceData);


            console.log("-----------------------------------------");
            console.log("INVOICE SAVED TO MONGODB");
            console.log("Saved ID:", savedInvoice._id);
            console.log("Invoice Name:", savedInvoice.invoiceName);
            console.log("Status:", savedInvoice.status);
            console.log("-----------------------------------------");


            // ==================================================
            // SEND RESPONSE
            // ==================================================

            return res.status(201).json({

                success: true,

                duplicate: false,

                message:
                    "Invoice uploaded and processed successfully.",

                invoice:
                    savedInvoice,

                ocrText:
                    extractedText

            });


        } catch (error) {

            console.error(
                "OCR / Upload Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to process invoice."

            });

        }

    }

);


// ======================================================
// GET ALL INVOICES
// ======================================================

router.get("/", async (req, res) => {

    try {

        const invoices =
            await Invoice.find()
                .sort({
                    createdAt: -1
                });

        return res.json(invoices);

    } catch (error) {

        console.error(
            "Get Invoices Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch invoices."

        });

    }

});


// ======================================================
// GET SINGLE INVOICE
// ======================================================

router.get("/:id", async (req, res) => {

    try {

        const invoice =
            await Invoice.findById(
                req.params.id
            );


        if (!invoice) {

            return res.status(404).json({

                success: false,

                message:
                    "Invoice not found."

            });

        }


        return res.json(invoice);

    } catch (error) {

        console.error(
            "Get Invoice Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch invoice."

        });

    }

});


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;