/* =====================================================
   AUTHENTICATION ROUTES
===================================================== */

const express = require("express");

const User = require("../models/User");

const router = express.Router();


/* =====================================================
   REGISTER
   POST /api/auth/register
===================================================== */

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            phone,
            company
        } = req.body;


        /* ---------------------------------------------
           VALIDATE INPUT
        --------------------------------------------- */

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });

        }


        /* ---------------------------------------------
           PASSWORD VALIDATION
        --------------------------------------------- */

        if (password.length < 5) {

            return res.status(400).json({
                success: false,
                message: "Password must be at least 5 characters"
            });

        }


        /* ---------------------------------------------
           CLEAN EMAIL
        --------------------------------------------- */

        const cleanEmail =
            email.toLowerCase().trim();


        /* ---------------------------------------------
           CHECK EXISTING USER
        --------------------------------------------- */

        const existingUser =
            await User.findOne({
                email: cleanEmail
            });


        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });

        }


        /* ---------------------------------------------
           CREATE USER
        --------------------------------------------- */

        const user = new User({

            name: name.trim(),

            email: cleanEmail,

            password: password,

            phone: phone || "",

            company: company || ""

        });


        await user.save();


        /* ---------------------------------------------
           SUCCESS RESPONSE
        --------------------------------------------- */

        return res.status(201).json({

            success: true,

            message: "Registration successful",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                phone: user.phone,

                company: user.company

            }

        });

    }

    catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Registration failed"

        });

    }

});


/* =====================================================
   LOGIN
   POST /api/auth/login
===================================================== */

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        /* ---------------------------------------------
           VALIDATE INPUT
        --------------------------------------------- */

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter email and password"

            });

        }


        /* ---------------------------------------------
           CLEAN EMAIL
        --------------------------------------------- */

        const cleanEmail =
            email.toLowerCase().trim();


        /* ---------------------------------------------
           FIND USER
        --------------------------------------------- */

        const user =
            await User.findOne({
                email: cleanEmail
            });


        /* ---------------------------------------------
           USER NOT FOUND
        --------------------------------------------- */

        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        /* ---------------------------------------------
           CHECK PASSWORD
        --------------------------------------------- */

        if (user.password !== password) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        /* ---------------------------------------------
           LOGIN SUCCESS
        --------------------------------------------- */

        return res.status(200).json({

            success: true,

            message:
                "Login successful",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                phone: user.phone || "",

                company: user.company || ""

            }

        });

    }

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Login failed"

        });

    }

});


/* =====================================================
   CHANGE PASSWORD
   POST /api/auth/change-password
===================================================== */

router.post("/change-password", async (req, res) => {

    try {

        const {
            email,
            currentPassword,
            newPassword
        } = req.body;


        /* ---------------------------------------------
           VALIDATE INPUT
        --------------------------------------------- */

        if (
            !email ||
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email, current password and new password are required"

            });

        }


        /* ---------------------------------------------
           PASSWORD LENGTH
        --------------------------------------------- */

        if (newPassword.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must contain at least 6 characters"

            });

        }


        /* ---------------------------------------------
           CLEAN EMAIL
        --------------------------------------------- */

        const cleanEmail =
            email.toLowerCase().trim();


        /* ---------------------------------------------
           FIND USER
        --------------------------------------------- */

        const user =
            await User.findOne({
                email: cleanEmail
            });


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        /* ---------------------------------------------
           CHECK CURRENT PASSWORD
        --------------------------------------------- */

        if (
            user.password !== currentPassword
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Current password is incorrect"

            });

        }


        /* ---------------------------------------------
           UPDATE PASSWORD
        --------------------------------------------- */

        user.password =
            newPassword;


        await user.save();


        /* ---------------------------------------------
           SUCCESS
        --------------------------------------------- */

        return res.status(200).json({

            success: true,

            message:
                "Password updated successfully"

        });

    }

    catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Password update failed"

        });

    }

});


/* =====================================================
   EXPORT ROUTER
===================================================== */

module.exports = router;