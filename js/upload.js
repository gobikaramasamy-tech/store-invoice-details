/* =====================================================
   AI INVOICE CHECKER
   UPLOAD INVOICE JAVASCRIPT
===================================================== */

const API_URL = "http://localhost:5000";

const invoiceFile =
    document.getElementById("invoiceFile");

const dropArea =
    document.getElementById("dropArea");

const selectedFile =
    document.getElementById("selectedFile");

const fileName =
    document.getElementById("fileName");

const fileSize =
    document.getElementById("fileSize");

const removeFile =
    document.getElementById("removeFile");

const checkInvoice =
    document.getElementById("checkInvoice");


let selectedInvoiceFile = null;


/* =====================================================
   FILE SELECTION
===================================================== */

invoiceFile.addEventListener(
    "change",
    function () {

        if (
            this.files &&
            this.files.length > 0
        ) {

            handleFile(
                this.files[0]
            );

        }

    }
);


/* =====================================================
   HANDLE FILE
===================================================== */

function handleFile(file) {

    console.log(
        "Selected file:",
        file.name
    );


    /* -----------------------------------------
       FILE TYPE
    ----------------------------------------- */

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        alert(
            "Please select a PDF, JPG, JPEG or PNG file."
        );

        return;

    }


    /* -----------------------------------------
       FILE SIZE
    ----------------------------------------- */

    if (
        file.size >
        10 * 1024 * 1024
    ) {

        alert(
            "File size must be less than 10 MB."
        );

        return;

    }


    /* -----------------------------------------
       SAVE FILE
    ----------------------------------------- */

    selectedInvoiceFile =
        file;


    /* -----------------------------------------
       DISPLAY FILE
    ----------------------------------------- */

    fileName.textContent =
        file.name;


    fileSize.textContent =
        formatFileSize(
            file.size
        );


    selectedFile.style.display =
        "flex";


    /* -----------------------------------------
       ENABLE BUTTON
    ----------------------------------------- */

    checkInvoice.disabled =
        false;


    console.log(
        "File ready for upload."
    );

}


/* =====================================================
   FORMAT FILE SIZE
===================================================== */

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " Bytes";

    }


    if (
        bytes <
        1024 * 1024
    ) {

        return (
            bytes / 1024
        ).toFixed(2) + " KB";

    }


    return (
        bytes /
        (1024 * 1024)
    ).toFixed(2) + " MB";

}


/* =====================================================
   REMOVE FILE
===================================================== */

removeFile.addEventListener(
    "click",
    function () {

        selectedInvoiceFile =
            null;


        invoiceFile.value =
            "";


        selectedFile.style.display =
            "none";


        checkInvoice.disabled =
            true;

    }
);


/* =====================================================
   DRAG AND DROP
===================================================== */

dropArea.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropArea.classList.add(
            "dragging"
        );

    }
);


dropArea.addEventListener(
    "dragleave",
    function () {

        dropArea.classList.remove(
            "dragging"
        );

    }
);


dropArea.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();


        dropArea.classList.remove(
            "dragging"
        );


        if (
            event.dataTransfer.files &&
            event.dataTransfer.files.length > 0
        ) {

            handleFile(
                event.dataTransfer.files[0]
            );

        }

    }
);


/* =====================================================
   CHECK INVOICE
===================================================== */

checkInvoice.addEventListener(
    "click",
    async function () {

        console.log(
            "Check Invoice clicked"
        );


        /* -----------------------------------------
           CHECK FILE
        ----------------------------------------- */

        if (!selectedInvoiceFile) {

            alert(
                "Please select an invoice first."
            );

            return;

        }


        /* -----------------------------------------
           BUTTON LOADING
        ----------------------------------------- */

        checkInvoice.disabled =
            true;


        checkInvoice.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';


        try {

            /* -------------------------------------
               CREATE FORM DATA
            ------------------------------------- */

            const formData =
                new FormData();


            formData.append(
                "invoice",
                selectedInvoiceFile
            );


            console.log(
                "Sending invoice to backend..."
            );


            /* -------------------------------------
               SEND TO BACKEND
            ------------------------------------- */

            const response =
                await fetch(
                    `${API_URL}/api/invoices/upload`,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            console.log(
                "Server response:",
                response.status
            );


            /* -------------------------------------
               READ RESPONSE
            ------------------------------------- */

            const data =
                await response.json();


            console.log(
                "Backend data:",
                data
            );


            /* -------------------------------------
               CHECK RESPONSE
            ------------------------------------- */

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Invoice upload failed."
                );

            }


            if (
                !data.invoice
            ) {

                throw new Error(
                    "Backend did not return invoice details."
                );

            }


            /* -------------------------------------
               SAVE INVOICE
            ------------------------------------- */

            localStorage.setItem(
                "selectedInvoice",
                JSON.stringify(
                    data.invoice
                )
            );


            localStorage.setItem(
                "invoiceFileName",
                selectedInvoiceFile.name
            );


            console.log(
                "Invoice saved in localStorage."
            );


            console.log(
                "Opening invoice preview..."
            );


            /* -------------------------------------
               OPEN PREVIEW
            ------------------------------------- */

            window.location.href =
                "invoice-preview.html";

        }

        catch (error) {

            console.error(
                "Upload Error:",
                error
            );


            alert(
                "Unable to process invoice.\n\n" +
                error.message
            );


            checkInvoice.disabled =
                false;


            checkInvoice.innerHTML =
                '<i class="fa-solid fa-magnifying-glass"></i> Check Invoice';

        }

    }
);