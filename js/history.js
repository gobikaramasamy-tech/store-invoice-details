
const API_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
    console.log("History page loaded");

    loadInvoiceHistory();

    // Refresh history when the refresh button is clicked
    const refreshButton = document.getElementById("refreshHistory");

    if (refreshButton) {
        refreshButton.addEventListener("click", () => {
            loadInvoiceHistory();
        });
    }
});


async function loadInvoiceHistory() {
    try {
        console.log("Loading invoices from backend...");

        const response = await fetch(`${API_URL}/api/invoices`);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        console.log("Invoice API response:", data);

        let invoices = [];

        // Response format: { success: true, invoices: [] }
        if (Array.isArray(data.invoices)) {
            invoices = data.invoices;
        }

        // Response format: []
        else if (Array.isArray(data)) {
            invoices = data;
        }

        console.log("Total invoices found:", invoices.length);

        displayInvoiceHistory(invoices);
        updateHistoryCounts(invoices);

    } catch (error) {
        console.error("History loading error:", error);

        const tableBody = document.getElementById("invoiceTableBody");

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Unable to load invoice history.
                    </td>
                </tr>
            `;
        }
    }
}


function displayInvoiceHistory(invoices) {
    const tableBody = document.getElementById("invoiceTableBody");

    if (!tableBody) {
        console.error("invoiceTableBody not found in history.html");
        return;
    }

    tableBody.innerHTML = "";

    if (invoices.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    No invoices found.
                </td>
            </tr>
        `;

        return;
    }

    invoices.forEach((invoice) => {
        const row = document.createElement("tr");

        const invoiceId = invoice._id || "";
        const invoiceName = invoice.invoiceName || "Unnamed Invoice";
        const invoiceNumber = invoice.invoiceNumber || "-";
        const vendorName = invoice.vendorName || "-";
        const invoiceDate = invoice.invoiceDate
            ? formatDate(invoice.invoiceDate)
            : "-";
        const totalAmount = invoice.totalAmount ?? 0;
        const status = invoice.status || "Needs Review";

        row.innerHTML = `
            <td>
                <a href="invoice-details.html?id=${invoiceId}">
                    ${escapeHTML(invoiceName)}
                </a>
            </td>

            <td>${escapeHTML(invoiceNumber)}</td>

            <td>${escapeHTML(vendorName)}</td>

            <td>${invoiceDate}</td>

            <td>₹${Number(totalAmount).toFixed(2)}</td>

            <td>
                <span class="status-badge">
                    ${escapeHTML(status)}
                </span>
            </td>

            <td>
                <button
                    class="view-btn"
                    onclick="viewInvoice('${invoiceId}')">
                    View
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


function updateHistoryCounts(invoices) {
    const totalElement = document.getElementById("totalInvoices");
    const validElement = document.getElementById("validInvoices");
    const duplicateElement = document.getElementById("duplicateInvoices");
    const reviewElement = document.getElementById("reviewInvoices");

    const validCount = invoices.filter(
        invoice => invoice.status === "Valid"
    ).length;

    const duplicateCount = invoices.filter(
        invoice =>
            invoice.status === "Duplicate" ||
            invoice.status === "Duplicate Invoice"
    ).length;

    const reviewCount = invoices.filter(
        invoice =>
            invoice.status === "Needs Review" ||
            invoice.status === "Review"
    ).length;

    if (totalElement) {
        totalElement.textContent = invoices.length;
    }

    if (validElement) {
        validElement.textContent = validCount;
    }

    if (duplicateElement) {
        duplicateElement.textContent = duplicateCount;
    }

    if (reviewElement) {
        reviewElement.textContent = reviewCount;
    }

    // Update dashboard/profile invoice count if available
    const invoiceCount = document.getElementById("invoiceCount");

    if (invoiceCount) {
        invoiceCount.textContent = invoices.length;
    }
}


function viewInvoice(invoiceId) {
    if (!invoiceId) {
        alert("Invoice ID not found");
        return;
    }

    window.location.href = `invoice-details.html?id=${invoiceId}`;
}


function formatDate(dateValue) {
    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-IN");
}


function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}