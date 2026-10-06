/* =====================================================
   AI INVOICE CHECKER
   PROFILE PAGE JAVASCRIPT
===================================================== */

const API_URL = "http://localhost:5000";

/* =====================================================
   GET USER DATA
===================================================== */

let userName =
    localStorage.getItem("userName") || "User";

let userEmail =
    localStorage.getItem("userEmail") ||
    "user@example.com";

let userPhone =
    localStorage.getItem("userPhone") || "";

let companyName =
    localStorage.getItem("companyName") || "";


/* =====================================================
   HTML ELEMENTS
===================================================== */

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const fullName =
    document.getElementById("fullName");

const emailAddress =
    document.getElementById("emailAddress");

const phoneNumber =
    document.getElementById("phoneNumber");

const company =
    document.getElementById("companyName");

const invoiceCount =
    document.getElementById("invoiceCount");

const memberSince =
    document.getElementById("memberSince");


/* =====================================================
   DISPLAY PROFILE
===================================================== */

function displayProfile() {

    /* Profile header */

    profileName.textContent = userName;

    profileEmail.textContent = userEmail;


    /* Personal information */

    fullName.textContent = userName;

    emailAddress.textContent = userEmail;

    phoneNumber.textContent =
        userPhone || "Not provided";

    company.textContent =
        companyName || "Not provided";


    /* Member since */

    const registrationDate =
        localStorage.getItem("registrationDate");

    if (registrationDate) {

        memberSince.textContent =
            registrationDate;

    } else {

        memberSince.textContent =
            "September 2026";

    }
}


/* =====================================================
   LOAD INVOICE COUNT FROM MONGODB
===================================================== */

async function loadInvoiceCount() {

    try {

        const response =
            await fetch(`${API_URL}/api/invoices`);

        if (!response.ok) {

            throw new Error(
                "Unable to load invoices"
            );

        }

        const data =
            await response.json();


        /* Backend returns invoice array */

        const invoices =
            Array.isArray(data)
                ? data
                : data.invoices || [];


        invoiceCount.textContent =
            invoices.length;


    } catch (error) {

        console.error(
            "Invoice Count Error:",
            error
        );

        invoiceCount.textContent = "0";
    }
}


/* =====================================================
   EDIT PROFILE MODAL
===================================================== */

const editModal =
    document.getElementById("editModal");

const editProfileBtn =
    document.getElementById("editProfileBtn");

const closeEditModal =
    document.getElementById("closeEditModal");

const cancelEdit =
    document.getElementById("cancelEdit");


/* Open modal */

editProfileBtn.addEventListener(
    "click",
    function () {

        document.getElementById(
            "editName"
        ).value = userName;


        document.getElementById(
            "editEmail"
        ).value = userEmail;


        document.getElementById(
            "editPhone"
        ).value = userPhone;


        document.getElementById(
            "editCompany"
        ).value = companyName;


        editModal.classList.add("show");

    }
);


/* Close modal */

closeEditModal.addEventListener(
    "click",
    closeEditProfile
);

cancelEdit.addEventListener(
    "click",
    closeEditProfile
);


function closeEditProfile() {

    editModal.classList.remove("show");

}


/* Close when clicking outside */

editModal.addEventListener(
    "click",
    function (event) {

        if (event.target === editModal) {

            closeEditProfile();

        }

    }
);


/* =====================================================
   SAVE PROFILE
===================================================== */

const editProfileForm =
    document.getElementById("editProfileForm");


editProfileForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const newName =
            document.getElementById(
                "editName"
            ).value.trim();


        const newEmail =
            document.getElementById(
                "editEmail"
            ).value.trim();


        const newPhone =
            document.getElementById(
                "editPhone"
            ).value.trim();


        const newCompany =
            document.getElementById(
                "editCompany"
            ).value.trim();


        /* Validate */

        if (!newName || !newEmail) {

            alert(
                "Please enter your name and email."
            );

            return;
        }


        /* Update variables */

        userName = newName;

        userEmail = newEmail;

        userPhone = newPhone;

        companyName = newCompany;


        /* Save to localStorage */

        localStorage.setItem(
            "userName",
            userName
        );

        localStorage.setItem(
            "userEmail",
            userEmail
        );

        localStorage.setItem(
            "userPhone",
            userPhone
        );

        localStorage.setItem(
            "companyName",
            companyName
        );


        /* Refresh profile */

        displayProfile();


        /* Close modal */

        closeEditProfile();


        alert(
            "Profile updated successfully!"
        );

    }
);


/* =====================================================
   CHANGE PASSWORD MODAL
===================================================== */

const passwordModal =
    document.getElementById("passwordModal");

const changePasswordBtn =
    document.getElementById(
        "changePasswordBtn"
    );

const securityPasswordBtn =
    document.getElementById(
        "securityPasswordBtn"
    );

const closePasswordModal =
    document.getElementById(
        "closePasswordModal"
    );

const cancelPassword =
    document.getElementById(
        "cancelPassword"
    );


/* Open password modal */

function openPasswordModal() {

    passwordModal.classList.add("show");

}


/* Buttons */

changePasswordBtn.addEventListener(
    "click",
    openPasswordModal
);

securityPasswordBtn.addEventListener(
    "click",
    openPasswordModal
);


/* Close */

closePasswordModal.addEventListener(
    "click",
    closePassword
);

cancelPassword.addEventListener(
    "click",
    closePassword
);


function closePassword() {

    passwordModal.classList.remove("show");

}


/* Outside click */

passwordModal.addEventListener(
    "click",
    function (event) {

        if (event.target === passwordModal) {

            closePassword();

        }

    }
);




/* =====================================================
   PASSWORD FORM
===================================================== */

const passwordForm =
    document.getElementById("passwordForm");

const passwordMessage =
    document.getElementById("passwordMessage");


passwordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const currentPassword =
            document.getElementById(
                "currentPassword"
            ).value;

        const newPassword =
            document.getElementById(
                "newPassword"
            ).value;

        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            ).value;


        /* Clear previous message */

        passwordMessage.className =
            "password-message";

        passwordMessage.textContent =
            "";


        /* Check current password */

        if (!currentPassword) {

            showPasswordMessage(
                "Please enter your current password.",
                "error"
            );

            return;
        }


        /* Check new password */

        if (newPassword.length < 6) {

            showPasswordMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;
        }


        /* Check confirmation */

        if (
            newPassword !== confirmPassword
        ) {

            showPasswordMessage(
                "New passwords do not match.",
                "error"
            );

            return;
        }


        /* Check email */

        if (!userEmail) {

            showPasswordMessage(
                "User email not found. Please login again.",
                "error"
            );

            return;
        }


        /* Disable submit button */

        const submitButton =
            passwordForm.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Updating...";

        }


        try {

            /* Send password change request */

            const response =
                await fetch(
                    `${API_URL}/api/auth/change-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email: userEmail,

                            currentPassword:
                                currentPassword,

                            newPassword:
                                newPassword

                        })
                    }
                );


            const data =
                await response.json();


            /* Backend error */

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Password update failed."
                );

            }


            /* Success */

            showPasswordMessage(
                "Password updated successfully.",
                "success"
            );


            /* Clear form */

            passwordForm.reset();


            /*
               Do NOT save the password
               in localStorage.

               Password is now stored
               in MongoDB.
            */


            setTimeout(
                function () {

                    closePassword();

                },
                1500
            );


        } catch (error) {

            console.error(
                "Change Password Error:",
                error
            );


            showPasswordMessage(
                error.message ||
                "Unable to update password.",
                "error"
            );


        } finally {

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Change Password";

            }

        }

    }
);


/* =====================================================
   PASSWORD MESSAGE
===================================================== */

function showPasswordMessage(
    message,
    type
) {

    passwordMessage.textContent =
        message;

    passwordMessage.className =
        "password-message " + type;

}


/* =====================================================
   LOGOUT
===================================================== */

const logoutBtn =
    document.getElementById("logoutBtn");

const logoutSecurityBtn =
    document.getElementById(
        "logoutSecurityBtn"
    );


function logoutUser(event) {

    if (event) {

        event.preventDefault();

    }


    /* Remove login session */

    localStorage.removeItem("loggedIn");

    localStorage.removeItem("userEmail");


    /* Go to login page */

    window.location.href =
        "login.html";

}


/* Sidebar logout */

logoutBtn.addEventListener(
    "click",
    logoutUser
);


/* Security logout */

logoutSecurityBtn.addEventListener(
    "click",
    logoutUser
);


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        displayProfile();

        loadInvoiceCount();

    }
);