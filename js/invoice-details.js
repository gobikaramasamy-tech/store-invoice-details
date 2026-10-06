/* =====================================================
   AI INVOICE CHECKER
   INVOICE DETAILS JAVASCRIPT
===================================================== */


/* =========================
   GET INVOICE DATA
========================= */

const params = new URLSearchParams(window.location.search);

const invoiceIndex = params.get("index");

const invoices = JSON.parse(
    localStorage.getItem("invoices")
) || [];


/* =========================
   CHECK INVOICE
========================= */

if (
    invoiceIndex === null ||
    !invoices[invoiceIndex]
) {

    document.querySelector(".details-container").innerHTML = `
    
        <div style="
            background:white;
            border:1px solid #e5e7eb;
            border-radius:12px;
            padding:50px 25px;
            text-align:center;
        ">

            <div style="
                width:60px;
                height:60px;
                border-radius:50%;
                background:#fee2e2;
                color:#dc2626;
                display:flex;
                align-items:center;
                justify-content:center;
                margin:0 auto 15px;
                font-size:25px;
            ">

                <i class="fa-solid fa-file-circle-xmark"></i>

            </div>

            <h2 style="
                color:#111827;
                margin-bottom:8px;
            ">
                Invoice Not Found
            </h2>

            <p style="
                color:#6b7280;
                margin-bottom:20px;
            ">
                The selected invoice could not be found.
            </p>

            <a
                href="history.html"
                style="
                    display:inline-block;
                    background:#2563eb;
                    color:white;
                    padding:11px 18px;
                    border-radius:8px;
                    text-decoration:none;
                    font-size:14px;
                    font-weight:600;
                "
            >
                Back to History
            </a>

        </div>

    `;

} else {

    const invoice = invoices[invoiceIndex];

    displayInvoice(invoice);

}


/* =========================
   DISPLAY INVOICE
========================= */

function displayInvoice(invoice) {


    /* =========================
       BASIC INFORMATION
    ========================== */

    document.getElementById("invoiceName").textContent =
        invoice.fileName || "Invoice";


    document.getElementById("uploadInfo").textContent =
        `Uploaded on ${invoice.uploadDate || "-"} at ${invoice.uploadTime || "-"}`;


    document.getElementById("invoiceNumber").textContent =
        invoice.invoiceNumber || "-";


    document.getElementById("vendorName").textContent =
        invoice.vendorName || "-";


    document.getElementById("vendorGST").textContent =
        invoice.vendorGST || "-";


    document.getElementById("invoiceDate").textContent =
        invoice.invoiceDate || "-";


    document.getElementById("poNumber").textContent =
        invoice.poNumber || "-";


    document.getElementById("currency").textContent =
        invoice.currency || "INR";


    document.getElementById("paymentTerms").textContent =
        invoice.paymentTerms || "-";


    /* =========================
       FILE SIZE
    ========================== */

    document.getElementById("fileSize").textContent =
        formatFileSize(invoice.fileSize);


    /* =========================
       AMOUNT
    ========================== */

    const subtotal =
        Number(invoice.subtotal) || 0;


    const tax =
        Number(invoice.tax) || 0;


    const discount =
        Number(invoice.discount) || 0;


    const total =
        Number(invoice.totalAmount) || 0;


    document.getElementById("subtotal").textContent =
        formatCurrency(subtotal, invoice.currency);


    document.getElementById("tax").textContent =
        formatCurrency(tax, invoice.currency);


    document.getElementById("discount").textContent =
        formatCurrency(discount, invoice.currency);


    document.getElementById("totalAmount").textContent =
        formatCurrency(total, invoice.currency);


    /* =========================
       OCR ACCURACY
    ========================== */

    const ocrAccuracy =
        Number(invoice.ocrAccuracy) || 0;


    document.getElementById("ocrAccuracy").textContent =
        `${ocrAccuracy}%`;


    document.getElementById("ocrProgress").style.width =
        `${Math.min(ocrAccuracy, 100)}%`;


    /* =========================
       DUPLICATE PROBABILITY
    ========================== */

    const duplicateProbability =
        Number(invoice.duplicateProbability) || 0;


    document.getElementById(
        "duplicateProbability"
    ).textContent =
        `${duplicateProbability}%`;


    document.getElementById(
        "duplicateProgress"
    ).style.width =
        `${Math.min(duplicateProbability, 100)}%`;


    /* =========================
       CALCULATION STATUS
    ========================== */

    const calculationStatus =
        invoice.calculationStatus || "Not Checked";


    const calculationElement =
        document.getElementById(
            "calculationStatus"
        );


    calculationElement.textContent =
        calculationStatus;


    applyStatusClass(
        calculationElement,
        calculationStatus
    );


    /* =========================
       DUPLICATE STATUS
    ========================== */

    const duplicateStatus =
        invoice.duplicateStatus || "Not Checked";


    const duplicateElement =
        document.getElementById(
            "duplicateStatus"
        );


    duplicateElement.textContent =
        duplicateStatus;


    applyStatusClass(
        duplicateElement,
        duplicateStatus
    );


    /* =========================
       FINAL STATUS
    ========================== */

    const finalStatus =
        invoice.finalStatus || invoice.status || "Processing";


    const statusBadge =
        document.getElementById("finalStatus");


    statusBadge.textContent =
        getReadableStatus(finalStatus);


    setFinalStatusClass(
        statusBadge,
        finalStatus
    );


    /* =========================
       RECOMMENDATION
    ========================== */

    showRecommendation(
        finalStatus,
        duplicateStatus,
        calculationStatus
    );

}


/* =====================================================
   FORMAT FILE SIZE
===================================================== */

function formatFileSize(size) {

    if (!size) {

        return "Not available";

    }


    const bytes = Number(size);


    if (bytes < 1024) {

        return `${bytes} Bytes`;

    }


    if (bytes < 1024 * 1024) {

        return `${(bytes / 1024).toFixed(1)} KB`;

    }


    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

}


/* =====================================================
   FORMAT CURRENCY
===================================================== */

function formatCurrency(amount, currency) {

    const selectedCurrency =
        currency || "INR";


    let symbol = "₹";


    if (selectedCurrency === "USD") {

        symbol = "$";

    }

    else if (selectedCurrency === "EUR") {

        symbol = "€";

    }

    else if (selectedCurrency === "GBP") {

        symbol = "£";

    }

    else if (selectedCurrency === "INR") {

        symbol = "₹";

    }


    return `${symbol}${amount.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

}


/* =====================================================
   STATUS CLASS
===================================================== */

function applyStatusClass(element, status) {

    const value =
        String(status).toLowerCase();


    element.classList.remove(
        "success",
        "danger",
        "warning"
    );


    if (
        value.includes("valid") ||
        value.includes("correct") ||
        value.includes("not duplicate") ||
        value.includes("clear")
    ) {

        element.classList.add("success");

    }

    else if (
        value.includes("duplicate") ||
        value.includes("incorrect") ||
        value.includes("failed")
    ) {

        element.classList.add("danger");

    }

    else {

        element.classList.add("warning");

    }

}


/* =====================================================
   FINAL STATUS CLASS
===================================================== */

function setFinalStatusClass(
    element,
    status
) {

    const value =
        String(status).toLowerCase();


    element.classList.remove(
        "valid",
        "duplicate",
        "review"
    );


    if (
        value === "valid" ||
        value.includes("valid")
    ) {

        element.classList.add("valid");

    }

    else if (
        value === "duplicate" ||
        value.includes("duplicate")
    ) {

        element.classList.add("duplicate");

    }

    else if (
        value === "review" ||
        value.includes("review")
    ) {

        element.classList.add("review");

    }

}


/* =====================================================
   READABLE STATUS
===================================================== */

function getReadableStatus(status) {

    const value =
        String(status).toLowerCase();


    if (value.includes("valid")) {

        return "Valid Invoice";

    }


    if (value.includes("duplicate")) {

        return "Duplicate Invoice";

    }


    if (value.includes("review")) {

        return "Needs Review";

    }


    return status;

}


/* =====================================================
   AI RECOMMENDATION
===================================================== */

function showRecommendation(
    finalStatus,
    duplicateStatus,
    calculationStatus
) {

    const card =
        document.getElementById(
            "recommendationCard"
        );


    const icon =
        document.getElementById(
            "recommendationIcon"
        );


    const title =
        document.getElementById(
            "recommendation"
        );


    const text =
        document.getElementById(
            "recommendationText"
        );


    const status =
        String(finalStatus).toLowerCase();


    /* =========================
       VALID
    ========================== */

    if (status.includes("valid")) {

        card.className =
            "recommendation-card";


        icon.className =
            "fa-solid fa-circle-check";


        title.textContent =
            "Invoice is valid";


        text.textContent =
            "No duplicate invoice was detected and the invoice calculations are correct.";

        return;

    }


    /* =========================
       DUPLICATE
    ========================== */

    if (status.includes("duplicate")) {

        card.className =
            "recommendation-card duplicate";


        icon.className =
            "fa-solid fa-circle-exclamation";


        title.textContent =
            "Duplicate invoice detected";


        text.textContent =
            "A matching invoice already exists in the system. Please review this invoice before processing.";

        return;

    }


    /* =========================
       REVIEW
    ========================== */

    if (status.includes("review")) {

        card.className =
            "recommendation-card review";


        icon.className =
            "fa-solid fa-triangle-exclamation";


        title.textContent =
            "Invoice needs review";


        text.textContent =
            "The invoice requires manual verification because one or more validation checks need attention.";

        return;

    }


    /* =========================
       DEFAULT
    ========================== */

    card.className =
        "recommendation-card";


    icon.className =
        "fa-solid fa-circle-info";


    title.textContent =
        "Invoice verification completed";


    text.textContent =
        "The invoice has been checked by the AI verification system.";

}


/* =====================================================
   LOGOUT
===================================================== */

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            localStorage.removeItem(
                "loggedIn"
            );


            localStorage.removeItem(
                "userEmail"
            );


            window.location.href =
                "login.html";

        }
    );

}