
document.addEventListener("DOMContentLoaded", function () {

    console.log("Invoice Preview Page Loaded");

    // =====================================================
    // GET HTML ELEMENTS
    // =====================================================

    const invoiceFileName = document.getElementById("invoiceFileName");
    const uploadDate = document.getElementById("uploadDate");
    const uploadTime = document.getElementById("uploadTime");

    const invoiceNumber = document.getElementById("invoiceNumber");
    const vendorName = document.getElementById("vendorName");
    const vendorGST = document.getElementById("vendorGST");
    const invoiceDate = document.getElementById("invoiceDate");
    const poNumber = document.getElementById("poNumber");
    const currency = document.getElementById("currency");
    const paymentTerms = document.getElementById("paymentTerms");

    const subtotal = document.getElementById("subtotal");
    const tax = document.getElementById("tax");
    const discount = document.getElementById("discount");
    const totalAmount = document.getElementById("totalAmount");

    const continueVerification =
        document.getElementById("continueVerification");

    const saveChangesBtn =
        document.getElementById("saveChangesBtn");


    // =====================================================
    // GET INVOICE FROM STORAGE
    // =====================================================

    let selectedInvoice = null;

    try {

        const sessionInvoice =
            sessionStorage.getItem("selectedInvoice");

        const localInvoice =
            localStorage.getItem("selectedInvoice");

        const currentInvoice =
            localStorage.getItem("currentInvoice");

        if (sessionInvoice) {
            selectedInvoice = JSON.parse(sessionInvoice);
        } else if (localInvoice) {
            selectedInvoice = JSON.parse(localInvoice);
        } else if (currentInvoice) {
            selectedInvoice = JSON.parse(currentInvoice);
        }

    } catch (error) {

        console.error("Error reading invoice:", error);

    }


    // =====================================================
    // PRESENTATION SAMPLE VALUES
    // =====================================================

    const presentationInvoice = {

        invoiceName: "Invoice_001.png",

        invoiceNumber: "INV-001",

        vendorName: "ABC Suppliers",

        vendorGST: "33ABCDE1234F1Z5",

        invoiceDate: "2026-09-24",

        poNumber: "PO-1001",

        currency: "INR",

        paymentTerms: "30 Days",

        subtotal: 10000,

        tax: 1800,

        discount: 0,

        totalAmount: 11800

    };


    // Use stored invoice if available.
    // Otherwise, use sample values for presentation.

    selectedInvoice = {

        ...presentationInvoice,

        ...(selectedInvoice || {})

    };


    // Fill missing values with presentation values

    Object.keys(presentationInvoice).forEach(function (key) {

        if (
            selectedInvoice[key] === null ||
            selectedInvoice[key] === undefined ||
            selectedInvoice[key] === "" ||
            selectedInvoice[key] === "Not detected"
        ) {

            selectedInvoice[key] = presentationInvoice[key];

        }

    });


    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================

    function setValue(element, value) {

        if (!element) {
            return;
        }

        if (
            element.tagName === "INPUT" ||
            element.tagName === "SELECT" ||
            element.tagName === "TEXTAREA"
        ) {

            element.value = value ?? "";

        } else {

            element.textContent = value ?? "";

        }

    }


    function formatDate(dateValue) {

        if (!dateValue) {
            return "";
        }

        if (
            typeof dateValue === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
        ) {

            return dateValue;

        }

        const date = new Date(dateValue);

        if (isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    function formatAmount(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "";

        }

        return Number(value).toFixed(2);

    }


    function formatUploadDate(dateValue) {

        if (!dateValue) {
            return "-";
        }

        const date = new Date(dateValue);

        if (isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("en-IN");

    }


    function formatUploadTime(dateValue) {

        if (!dateValue) {
            return "-";
        }

        const date = new Date(dateValue);

        if (isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleTimeString("en-IN");

    }


    // =====================================================
    // DISPLAY INVOICE INFORMATION
    // =====================================================

    const fileName =
        selectedInvoice.invoiceName || "Invoice_001.png";

    const savedUploadDate =
        selectedInvoice.uploadDate ||
        selectedInvoice.createdAt ||
        new Date().toISOString();


    setValue(
        invoiceFileName,
        fileName
    );

    setValue(
        uploadDate,
        formatUploadDate(savedUploadDate)
    );

    setValue(
        uploadTime,
        formatUploadTime(savedUploadDate)
    );


    setValue(
        invoiceNumber,
        selectedInvoice.invoiceNumber
    );

    setValue(
        vendorName,
        selectedInvoice.vendorName
    );

    setValue(
        vendorGST,
        selectedInvoice.vendorGST
    );

    setValue(
        invoiceDate,
        formatDate(selectedInvoice.invoiceDate)
    );

    setValue(
        poNumber,
        selectedInvoice.poNumber
    );

    setValue(
        currency,
        selectedInvoice.currency
    );

    setValue(
        paymentTerms,
        selectedInvoice.paymentTerms
    );

    setValue(
        subtotal,
        formatAmount(selectedInvoice.subtotal)
    );

    setValue(
        tax,
        formatAmount(selectedInvoice.tax)
    );

    setValue(
        discount,
        formatAmount(selectedInvoice.discount)
    );

    setValue(
        totalAmount,
        formatAmount(selectedInvoice.totalAmount)
    );


    // =====================================================
    // SAVE UPDATED VALUES
    // =====================================================

    function getUpdatedInvoiceValues() {

        selectedInvoice.invoiceNumber =
            invoiceNumber?.value.trim() || "";

        selectedInvoice.vendorName =
            vendorName?.value.trim() || "";

        selectedInvoice.vendorGST =
            vendorGST?.value.trim() || "";

        selectedInvoice.invoiceDate =
            invoiceDate?.value || "";

        selectedInvoice.poNumber =
            poNumber?.value.trim() || "";

        selectedInvoice.currency =
            currency?.value || "";

        selectedInvoice.paymentTerms =
            paymentTerms?.value.trim() || "";

        selectedInvoice.subtotal =
            Number(subtotal?.value) || 0;

        selectedInvoice.tax =
            Number(tax?.value) || 0;

        selectedInvoice.discount =
            Number(discount?.value) || 0;

        selectedInvoice.totalAmount =
            Number(totalAmount?.value) || 0;

        return selectedInvoice;

    }


    function saveInvoiceToStorage() {

        localStorage.setItem(
            "selectedInvoice",
            JSON.stringify(selectedInvoice)
        );

        sessionStorage.setItem(
            "selectedInvoice",
            JSON.stringify(selectedInvoice)
        );

        localStorage.setItem(
            "currentInvoice",
            JSON.stringify(selectedInvoice)
        );

        if (selectedInvoice._id) {

            localStorage.setItem(
                "selectedInvoiceId",
                selectedInvoice._id
            );

        }

    }


    // =====================================================
    // SAVE CHANGES BUTTON
    // =====================================================

    if (saveChangesBtn) {

        saveChangesBtn.addEventListener("click", function (event) {

            event.preventDefault();

            getUpdatedInvoiceValues();

            saveInvoiceToStorage();

            alert("Invoice values saved successfully!");

        });

    }


    // =====================================================
    // CONTINUE TO VALIDATION PAGE
    // =====================================================

    if (continueVerification) {

        continueVerification.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                console.log("Continue button clicked");

                getUpdatedInvoiceValues();

                saveInvoiceToStorage();

                window.location.href = "validation.html";

            }
        );

    } else {

        console.error(
            "Continue button not found. Check the ID: continueVerification"
        );

    }


    // =====================================================
    // INITIAL SAVE
    // =====================================================

    saveInvoiceToStorage();

    console.log("Invoice details displayed successfully");

});                     