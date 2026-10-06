document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.getElementById("registerForm");

    if (!registerForm) {
        console.error("Register form not found.");
        return;
    }


    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const terms =
            document.getElementById("terms").checked;


        /* ==========================================
           VALIDATION
        ========================================== */

        if (!name || !email || !password || !confirmPassword) {

            alert("Please fill all fields.");

            return;
        }


        if (!terms) {

            alert("Please accept the Terms & Conditions.");

            return;
        }


        if (password.length < 5) {

            alert("Password must be at least 5 characters.");

            return;
        }


        if (password !== confirmPassword) {

            alert("Passwords do not match.");

            return;
        }


        /* ==========================================
           REGISTER BUTTON
        ========================================== */

        const registerBtn =
            document.getElementById("registerBtn");

        registerBtn.disabled = true;

        registerBtn.querySelector("span").textContent =
            "Creating Account...";


        try {

            /* ==========================================
               SEND REQUEST TO EXPRESS BACKEND
            ========================================== */

            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        password: password

                    })
                }
            );


            const data = await response.json();


            /* ==========================================
               SUCCESS
            ========================================== */

            if (response.ok && data.success) {

                alert("Registration successful!");


                registerForm.reset();


                window.location.href =
                    "login.html";


            } else {

                alert(
                    data.message ||
                    "Registration failed."
                );

            }


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );


            alert(
                "Cannot connect to the backend.\n\n" +
                "Please make sure the server is running."
            );


        } finally {

            registerBtn.disabled = false;

            registerBtn.querySelector("span").textContent =
                "Create Account";

        }

    });

});