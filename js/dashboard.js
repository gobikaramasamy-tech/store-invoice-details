
/* =====================================================
   AI INVOICE CHECKER
   DASHBOARD JAVASCRIPT
   MongoDB → Dashboard Statistics + Recent Invoices
===================================================== */

const API_URL = "http://localhost:5000";


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard loaded successfully");

    loadDashboardData();
});


// =====================================================
// LOAD INVOICES FROM MONGODB
// =====================================================

async function loadDashboardData() {
    try {
        console.log("Loading invoices from MongoDB...");

        const response = await fetch(`${API_URL}/api/invoices`);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        console.log("Dashboard API response:", data);

        let invoices = [];

        // Backend response:
        // { success: true, invoices: [] }

        if (Array.isArray(data.invoices)) {
            invoices = data.invoices;
        } else if (Array.isArray(data)) {
            invoices = data;
        }

        console.log("Total invoices received:", invoices.length);

        // Update dashboard statistics
        updateDashboardStatistics(invoices);

        // Display recent invoices
        displayRecentInvoices(invoices);

    } catch (error) {
        console.error("Dashboard loading error:", error);

        updateDashboardStatistics([]);
        displayRecentInvoices([]);
    }
}


// =====================================================
// UPDATE DASHBOARD STATISTICS
// =====================================================

function updateDashboardStatistics(invoices) {

    const total = invoices.length;

    const valid = invoices.filter(invoice => {
        const status = String(invoice.status || "").toLowerCase().trim();

        return status === "valid";
    }).length;


    const duplicates = invoices.filter(invoice => {
        const status = String(invoice.status || "").toLowerCase().trim();

        return (
            status.includes("duplicate") ||
            status.includes("duplicated")
        );
    }).length;


    const needsReview = invoices.filter(invoice => {
        const status = String(invoice.status || "").toLowerCase().trim();

        return (
            status.includes("review") ||
            status.includes("suspicious") ||
            status.includes("pending") ||
            status.includes("invalid")
        );
    }).length;


    // Update HTML elements
    setText("totalInvoices", total);
    setText("validInvoices", valid);
    setText("duplicateInvoices", duplicates);
    setText("reviewInvoices", needsReview);


    console.log("Dashboard statistics:", {
        total: total,
        valid: valid,
        duplicates: duplicates,
        needsReview: needsReview
    });
}


// =====================================================
// DISPLAY RECENT INVOICES
// =====================================================

function displayRecentInvoices(invoices) {

    const tableBody = document.getElementById("recentTableBody");

    if (!tableBody) {
        console.error("recentTableBody not found in dashboard.html");
        return;
    }

    tableBody.innerHTML = "";


    if (invoices.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    No recent invoices found.
                </td>
            </tr>
        `;

        return;
    }


    // Sort invoices by newest upload date
    const sortedInvoices = [...invoices].sort((a, b) => {

        const dateA = new Date(
            a.uploadDate || a.createdAt || 0
        );

        const dateB = new Date(
            b.uploadDate || b.createdAt || 0
        );

        return dateB - dateA;
    });


    // Display only the latest 5 invoices
    const recentInvoices = sortedInvoices.slice(0, 5);


    recentInvoices.forEach(invoice => {

        const row = document.createElement("tr");


        const invoiceName =
            invoice.invoiceName || "Unnamed Invoice";

        const vendorName =
            invoice.vendorName || "-";

        const uploadDate =
            formatDate(invoice.uploadDate || invoice.createdAt);

        const amount =
            formatAmount(
                invoice.totalAmount,
                invoice.currency
            );

        const status =
            invoice.status || "Needs Review";


        row.innerHTML = `
            <td>
                <a
                    href="invoice-details.html?id=${encodeURIComponent(invoice._id || "")}"
                    class="invoice-name">
                    ${escapeHTML(invoiceName)}
                </a>
            </td>

            <td>
                ${escapeHTML(vendorName)}
            </td>

            <td>
                ${uploadDate}
            </td>

            <td>
                ${amount}
            </td>

            <td>
                <span class="status-badge ${getStatusClass(status)}">
                    ${escapeHTML(status)}
                </span>
            </td>
        `;


        tableBody.appendChild(row);
    });
}


// =====================================================
// SET TEXT SAFELY
// =====================================================

function setText(elementId, value) {

    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    } else {
        console.warn(`Element not found: ${elementId}`);
    }
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// =====================================================
// FORMAT AMOUNT
// =====================================================

function formatAmount(amount, currency) {

    const value = Number(amount) || 0;

    const currencyCode = currency || "INR";

    try {

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currencyCode,
            maximumFractionDigits: 2
        }).format(value);

    } catch (error) {

        return `${currencyCode} ${value.toFixed(2)}`;
    }
}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {

    const value = String(status || "").toLowerCase();

    if (value === "valid") {
        return "status-valid";
    }

    if (
        value.includes("duplicate") ||
        value.includes("duplicated")
    ) {
        return "status-duplicate";
    }

    if (
        value.includes("review") ||
        value.includes("suspicious") ||
        value.includes("pending") ||
        value.includes("invalid")
    ) {
        return "status-review";
    }

    return "status-review";
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}