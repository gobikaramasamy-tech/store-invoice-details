
document.addEventListener("DOMContentLoaded", function () {

    console.log("Invoice Verification Page Loaded");

    // =====================================================
    // GET HTML ELEMENTS
    // =====================================================

    const invoiceNameElement =
        document.getElementById("invoiceName");

    const invoiceNumberElement =
        document.getElementById("invoiceNumber");

    const finalStatusBadge =
        document.getElementById("finalStatusBadge");

    const ocrAccuracyElement =
        document.getElementById("ocrAccuracy");

    const duplicateProbabilityElement =
        document.getElementById("duplicateProbability");

    const calculationStatusElement =
        document.getElementById("calculationStatus");

    const duplicateStatusElement =
        document.getElementById("duplicateStatus");

    const recommendationElement =
        document.getElementById("recommendation");

    const recommendationTextElement =
        document.getElementById("recommendationText");

    const saveInvoiceButton =
        document.getElementById("saveInvoice");


    // =====================================================
    // GET INVOICE DATA FROM STORAGE
    // =====================================================

    let invoice = null;

    try {

        const sessionInvoice =
            sessionStorage.getItem("selectedInvoice");

        const localInvoice =
            localStorage.getItem("selectedInvoice");

        const currentInvoice =
            localStorage.getItem("currentInvoice");

        if (sessionInvoice) {

            invoice = JSON.parse(sessionInvoice);

        } else if (localInvoice) {

            invoice = JSON.parse(localInvoice);

        } else if (currentInvoice) {

            invoice = JSON.parse(currentInvoice);

        }

    } catch (error) {

        console.error(
            "Error reading invoice data:",
            error
        );

    }


    // =====================================================
    // DEFAULT PRESENTATION VALUES
    // =====================================================

    if (!invoice) {

        invoice = {

            invoiceName: "Invoice_001.png",

            invoiceNumber: "INV-001",

            vendorName: "ABC Suppliers",

            subtotal: 10000,

            tax: 1800,

            discount: 0,

            totalAmount: 11800,

            ocrAccuracy: 96,

            duplicateProbability: 12

        };

    }


    // =====================================================
    // CALCULATION VERIFICATION
    // =====================================================

    const subtotal =
        Number(invoice.subtotal) || 0;

    const tax =
        Number(invoice.tax) || 0;

    const discount =
        Number(invoice.discount) || 0;

    const totalAmount =
        Number(invoice.totalAmount) || 0;


    const calculatedTotal =
        subtotal + tax - discount;


    const calculationCorrect =
        Math.abs(calculatedTotal - totalAmount) < 0.01;


    // =====================================================
    // DUPLICATE VERIFICATION
    // =====================================================

    const isDuplicate =
        invoice.duplicate === true ||
        invoice.status === "Duplicate";


    // =====================================================
    // DISPLAY INVOICE DETAILS
    // =====================================================

    if (invoiceNameElement) {

        invoiceNameElement.textContent =
            invoice.invoiceName || "Invoice";

    }


    if (invoiceNumberElement) {

        invoiceNumberElement.textContent =
            "Invoice Number: " +
            (invoice.invoiceNumber || "INV-001");

    }


    // =====================================================
    // DISPLAY OCR ACCURACY
    // =====================================================

    if (ocrAccuracyElement) {

        const accuracy =
            invoice.ocrAccuracy ?? 96;

        ocrAccuracyElement.textContent =
            accuracy + "%";

    }


    // =====================================================
    // DISPLAY DUPLICATE PROBABILITY
    // =====================================================

    if (duplicateProbabilityElement) {

        const probability =
            invoice.duplicateProbability ?? 12;

        duplicateProbabilityElement.textContent =
            probability + "%";

    }


    // =====================================================
    // DISPLAY CALCULATION STATUS
    // =====================================================

    if (calculationStatusElement) {

        calculationStatusElement.textContent =
            calculationCorrect ? "Correct" : "Incorrect";

        calculationStatusElement.className =
            calculationCorrect
                ? "success-text"
                : "error-text";

    }


    // =====================================================
    // DISPLAY DUPLICATE STATUS
    // =====================================================

    if (duplicateStatusElement) {

        duplicateStatusElement.textContent =
            isDuplicate
                ? "Duplicate Invoice"
                : "No Duplicate";

    }


    // =====================================================
    // DISPLAY FINAL STATUS
    // =====================================================

    if (finalStatusBadge) {

        finalStatusBadge.textContent =
            isDuplicate || !calculationCorrect
                ? "Needs Review"
                : "Valid Invoice";

    }


    // =====================================================
    // DISPLAY RECOMMENDATION
    // =====================================================

    if (isDuplicate) {

        if (recommendationElement) {

            recommendationElement.textContent =
                "DUPLICATE INVOICE";

        }

        if (recommendationTextElement) {

            recommendationTextElement.textContent =
                "This invoice matches a previously saved invoice. Please review the invoice details.";

        }

    } else if (!calculationCorrect) {

        if (recommendationElement) {

            recommendationElement.textContent =
                "CHECK CALCULATION";

        }

        if (recommendationTextElement) {

            recommendationTextElement.textContent =
                "The subtotal, tax, discount and total amount do not match. Please check the invoice values.";

        }

    } else {

        if (recommendationElement) {

            recommendationElement.textContent =
                "VALID INVOICE";

        }

        if (recommendationTextElement) {

            recommendationTextElement.textContent =
                "The invoice passed the calculation and duplicate verification checks.";

        }

    }


    // =====================================================
    // SAVE INVOICE BUTTON
    // =====================================================

    if (saveInvoiceButton) {

        saveInvoiceButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                // Save the verified status

                invoice.calculationStatus =
                    calculationCorrect
                        ? "Correct"
                        : "Incorrect";

                invoice.duplicateStatus =
                    isDuplicate
                        ? "Duplicate Invoice"
                        : "No Duplicate";

                invoice.status =
                    isDuplicate || !calculationCorrect
                        ? "Needs Review"
                        : "Valid";

                invoice.recommendation =
                    recommendationElement
                        ? recommendationElement.textContent
                        : "Valid Invoice";


                // Save invoice data

                localStorage.setItem(
                    "selectedInvoice",
                    JSON.stringify(invoice)
                );

                localStorage.setItem(
                    "currentInvoice",
                    JSON.stringify(invoice)
                );

                sessionStorage.setItem(
                    "selectedInvoice",
                    JSON.stringify(invoice)
                );


                alert(
                    "Invoice saved successfully!"
                );

                console.log(
                    "Saved Invoice:",
                    invoice
                );

            }
        );

    }


    console.log(
        "Invoice verification completed successfully."
    );

});