document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        console.error("loginForm not found");
        return;
    }

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        const loginBtn = document.getElementById("loginBtn");

        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = "Logging in...";
        }

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {

                // Save logged-in user
                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(data.user)
                );

                alert("Login successful!");

                window.location.href = "dashboard.html";

            } else {

                alert(
                    data.message ||
                    "Invalid email or password."
                );
            }

        } catch (error) {

            console.error("Login Error:", error);

            alert(
                "Cannot connect to the backend.\n\n" +
                "Please make sure the backend server is running."
            );

        } finally {

            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = "Login";
            }

        }

    });

});