// ==========================================
// AI INVOICE CHECKER - REPORTS
// MongoDB Connected Version
// ==========================================

const API_URL = "http://localhost:5000/api/invoices";

document.addEventListener("DOMContentLoaded", function () {

    loadReports();

});


// ==========================================
// LOAD REPORT DATA
// ==========================================

async function loadReports() {

    try {

        console.log("Loading reports from MongoDB...");

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const data = await response.json();

        console.log("Reports data:", data);

        if (!data.success || !Array.isArray(data.invoices)) {
            throw new Error("Invalid invoice data.");
        }

        const invoices = data.invoices;


        // ==========================================
        // BASIC COUNTS
        // ==========================================

        const total = invoices.length;

        const valid = invoices.filter(invoice =>
            String(invoice.status || "").toLowerCase() === "valid"
        ).length;

        const duplicate = invoices.filter(invoice =>
            String(invoice.status || "")
                .toLowerCase()
                .includes("duplicate")
        ).length;

        const review = invoices.filter(invoice => {

            const status =
                String(invoice.status || "").toLowerCase();

            return (
                status.includes("review") ||
                status.includes("suspicious")
            );

        }).length;


        // ==========================================
        // SUMMARY CARDS
        // ==========================================

        setText("totalInvoices", total);
        setText("validInvoices", valid);
        setText("duplicateInvoices", duplicate);
        setText("reviewInvoices", review);


        // ==========================================
        // PERCENTAGES
        // ==========================================

        const validPercentage =
            total > 0 ? (valid / total) * 100 : 0;

        const duplicatePercentage =
            total > 0 ? (duplicate / total) * 100 : 0;

        const reviewPercentage =
            total > 0 ? (review / total) * 100 : 0;


        setText(
            "validPercentage",
            Math.round(validPercentage) + "%"
        );

        setText(
            "duplicatePercentage",
            Math.round(duplicatePercentage) + "%"
        );

        setText(
            "reviewPercentage",
            Math.round(reviewPercentage) + "%"
        );


        // Progress bars
        setWidth(
            "validBar",
            validPercentage
        );

        setWidth(
            "duplicateBar",
            duplicatePercentage
        );

        setWidth(
            "reviewBar",
            reviewPercentage
        );


        // ==========================================
        // FINANCIAL SUMMARY
        // ==========================================

        let totalAmount = 0;
        let highestAmount = 0;


        invoices.forEach(invoice => {

            const amount =
                Number(invoice.totalAmount) || 0;

            totalAmount += amount;

            if (amount > highestAmount) {
                highestAmount = amount;
            }

        });


        const averageAmount =
            total > 0
                ? totalAmount / total
                : 0;


        setText(
            "totalAmount",
            formatCurrency(totalAmount)
        );

        setText(
            "averageAmount",
            formatCurrency(averageAmount)
        );

        setText(
            "highestAmount",
            formatCurrency(highestAmount)
        );


        // ==========================================
        // RECENT INVOICES
        // ==========================================

        displayRecentInvoices(invoices);


    } catch (error) {

        console.error(
            "Reports Error:",
            error
        );

    }

}


// ==========================================
// RECENT INVOICES TABLE
// ==========================================

function displayRecentInvoices(invoices) {

    const table =
        document.getElementById(
            "recentTableBody"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (!table) return;


    if (invoices.length === 0) {

        table.innerHTML = "";

        if (emptyState) {
            emptyState.style.display = "flex";
        }

        return;
    }


    if (emptyState) {
        emptyState.style.display = "none";
    }


    table.innerHTML = "";


    invoices.slice(0, 5).forEach(invoice => {

        const row =
            document.createElement("tr");


        const invoiceName =
            invoice.invoiceName || "Invoice";

        const vendorName =
            invoice.vendorName || "-";

        const status =
            invoice.status || "Needs Review";


        const amount =
            formatCurrency(
                Number(invoice.totalAmount) || 0
            );


        const date =
            formatDate(invoice.uploadDate);


        let statusClass = "review";

        if (
            String(status).toLowerCase() === "valid"
        ) {
            statusClass = "valid";
        }

        if (
            String(status)
                .toLowerCase()
                .includes("duplicate")
        ) {
            statusClass = "duplicate";
        }


        row.innerHTML = `

            <td>
                <span class="invoice-name">
                    <i class="fa-regular fa-file"></i>
                    ${escapeHTML(invoiceName)}
                </span>
            </td>

            <td>
                ${escapeHTML(vendorName)}
            </td>

            <td>
                ${date}
            </td>

            <td>
                ${amount}
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${escapeHTML(status)}
                </span>
            </td>

        `;


        // Click invoice
        const invoiceButton =
            row.querySelector(".invoice-name");


        if (invoiceButton) {

            invoiceButton.style.cursor = "pointer";

            invoiceButton.addEventListener(
                "click",
                function () {

                    localStorage.setItem(
                        "selectedInvoice",
                        JSON.stringify(invoice)
                    );

                    if (invoice._id) {

                        localStorage.setItem(
                            "selectedInvoiceId",
                            invoice._id
                        );

                    }

                    localStorage.setItem(
                        "currentInvoice",
                        JSON.stringify(invoice)
                    );

                    window.location.href =
                        "invoice-preview.html";

                }
            );

        }


        table.appendChild(row);

    });

}


// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(amount);

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) return "-";

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================
// SET TEXT
// ==========================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


// ==========================================
// SET WIDTH
// ==========================================

function setWidth(id, percentage) {

    const element =
        document.getElementById(id);

    if (element) {

        element.style.width =
            percentage + "%";

    }

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}