document.addEventListener("DOMContentLoaded", async function () {

    console.log("=================================");
    console.log("VALIDATION JS STARTED");
    console.log("=================================");


    const API_URL = "http://localhost:5000/api/invoices";


    // =====================================================
    // STEP 1: GET INVOICE ID
    // =====================================================

    let invoiceId =
        localStorage.getItem("selectedInvoiceId");

    console.log(
        "selectedInvoiceId:",
        invoiceId
    );


    // =====================================================
    // STEP 2: CHECK selectedInvoice
    // =====================================================

    const selectedInvoiceData =
        localStorage.getItem("selectedInvoice");

    console.log(
        "selectedInvoice:",
        selectedInvoiceData
    );


    let selectedInvoice = null;


    if (selectedInvoiceData) {

        try {

            selectedInvoice =
                JSON.parse(selectedInvoiceData);

            console.log(
                "Parsed selectedInvoice:",
                selectedInvoice
            );

        } catch (error) {

            console.error(
                "selectedInvoice JSON error:",
                error
            );

        }

    }


    // =====================================================
    // STEP 3: GET ID FROM selectedInvoice
    // =====================================================

    if (!invoiceId && selectedInvoice) {

        if (selectedInvoice._id) {

            invoiceId =
                selectedInvoice._id;

            localStorage.setItem(
                "selectedInvoiceId",
                invoiceId
            );

            console.log(
                "Invoice ID recovered from selectedInvoice:",
                invoiceId
            );

        }

    }


    // =====================================================
    // STEP 4: CHECK currentInvoice
    // =====================================================

    if (!invoiceId) {

        const currentInvoiceData =
            localStorage.getItem("currentInvoice");


        console.log(
            "currentInvoice:",
            currentInvoiceData
        );


        if (currentInvoiceData) {

            try {

                const currentInvoice =
                    JSON.parse(
                        currentInvoiceData
                    );


                if (currentInvoice._id) {

                    invoiceId =
                        currentInvoice._id;


                    localStorage.setItem(
                        "selectedInvoiceId",
                        invoiceId
                    );


                    console.log(
                        "Invoice ID recovered from currentInvoice:",
                        invoiceId
                    );

                }

            } catch (error) {

                console.error(
                    "currentInvoice JSON error:",
                    error
                );

            }

        }

    }


    // =====================================================
    // STEP 5: IF NO ID, SHOW LOCAL INVOICE
    // =====================================================

    if (!invoiceId) {

        console.log(
            "No MongoDB invoice ID found."
        );


        if (selectedInvoice) {

            console.log(
                "Displaying local invoice data."
            );

            displayInvoice(
                selectedInvoice
            );

            return;

        }


        alert(
            "Please upload and select an invoice first."
        );

        window.location.href =
            "upload.html";

        return;

    }


    // =====================================================
    // STEP 6: GET INVOICE FROM MONGODB
    // =====================================================

    try {

        console.log(
            "Fetching invoice from MongoDB..."
        );


        const response =
            await fetch(
                `${API_URL}/${invoiceId}`
            );


        console.log(
            "Server response status:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "Server response:",
            data
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Invoice not found"
            );

        }


        const invoice =
            data.invoice;


        console.log(
            "Invoice loaded successfully:",
            invoice
        );


        // Save again
        localStorage.setItem(
            "selectedInvoice",
            JSON.stringify(invoice)
        );


        localStorage.setItem(
            "selectedInvoiceId",
            invoice._id
        );


        // Display invoice
        displayInvoice(invoice);


    } catch (error) {

        console.error(
            "Validation Error:",
            error
        );


        // If MongoDB fetch fails but local invoice exists
        if (selectedInvoice) {

            console.log(
                "MongoDB failed. Using local invoice."
            );


            displayInvoice(
                selectedInvoice
            );

            return;

        }


        alert(
            "Unable to load invoice validation.\n\n" +
            error.message
        );

    }

});


// =========================================================
// DISPLAY INVOICE
// =========================================================

function displayInvoice(invoice) {

    console.log(
        "Displaying invoice:",
        invoice
    );


    // -----------------------------------------------------
    // INVOICE NAME
    // -----------------------------------------------------

    setText(
        "invoiceName",
        invoice.invoiceName ||
        invoice.fileName ||
        "Invoice"
    );


    // -----------------------------------------------------
    // INVOICE NUMBER
    // -----------------------------------------------------

    setText(
        "invoiceNumber",
        invoice.invoiceNumber ||
        "-"
    );


    // -----------------------------------------------------
    // OCR ACCURACY
    // -----------------------------------------------------

    setText(
        "ocrAccuracy",
        `${invoice.ocrAccuracy || 0}%`
    );


    // -----------------------------------------------------
    // DUPLICATE STATUS
    // -----------------------------------------------------

    const duplicateStatus =
        document.getElementById(
            "duplicateStatus"
        );


    if (duplicateStatus) {

        if (
            invoice.status ===
            "Duplicate Invoice"
        ) {

            duplicateStatus.textContent =
                "Duplicate";

        } else {

            duplicateStatus.textContent =
                "No Duplicate";

        }

    }


    // -----------------------------------------------------
    // DUPLICATE PROBABILITY
    // -----------------------------------------------------

    setText(
        "duplicateProbability",
        `${invoice.duplicateProbability || 0}% probability`
    );


    // -----------------------------------------------------
    // CALCULATION STATUS
    // -----------------------------------------------------

    setText(
        "calculationStatus",
        invoice.calculationStatus ||
        "Checking"
    );


    // -----------------------------------------------------
    // INVOICE STATUS
    // -----------------------------------------------------

    setText(
        "invoiceStatus",
        invoice.status ||
        "Needs Review"
    );


    // -----------------------------------------------------
    // RECOMMENDATION
    // -----------------------------------------------------

    setText(
        "recommendation",
        invoice.recommendation ||
        "Please review this invoice."
    );


    // -----------------------------------------------------
    // SUBTOTAL
    // -----------------------------------------------------

    setText(
        "subtotal",
        formatCurrency(
            invoice.subtotal
        )
    );


    // -----------------------------------------------------
    // TAX
    // -----------------------------------------------------

    setText(
        "tax",
        formatCurrency(
            invoice.tax
        )
    );


    // -----------------------------------------------------
    // DISCOUNT
    // -----------------------------------------------------

    setText(
        "discount",
        formatCurrency(
            invoice.discount
        )
    );


    // -----------------------------------------------------
    // EXPECTED TOTAL
    // -----------------------------------------------------

    const subtotal =
        Number(invoice.subtotal || 0);

    const tax =
        Number(invoice.tax || 0);

    const discount =
        Number(invoice.discount || 0);


    const expectedTotal =
        subtotal +
        tax -
        discount;


    setText(
        "expectedTotal",
        formatCurrency(
            expectedTotal
        )
    );


    // -----------------------------------------------------
    // ACTUAL INVOICE TOTAL
    // -----------------------------------------------------

    setText(
        "invoiceTotal",
        formatCurrency(
            invoice.totalAmount
        )
    );


    // -----------------------------------------------------
    // FINAL TITLE
    // -----------------------------------------------------

    setText(
        "finalTitle",
        invoice.status ||
        "Validation Complete"
    );


    // -----------------------------------------------------
    // FINAL MESSAGE
    // -----------------------------------------------------

    setText(
        "finalMessage",
        invoice.recommendation ||
        "Invoice validation completed."
    );


    console.log(
        "================================="
    );

    console.log(
        "VALIDATION DISPLAY COMPLETE"
    );

    console.log(
        "================================="
    );

}


// =========================================================
// SET TEXT
// =========================================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (!element) {

        console.warn(
            "Element not found:",
            id
        );

        return;

    }


    element.textContent =
        value;

}


// =========================================================
// FORMAT CURRENCY
// =========================================================

function formatCurrency(value) {

    return `₹${Number(
        value || 0
    ).toLocaleString("en-IN")}`;

}