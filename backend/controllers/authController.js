/* =====================================================
   AI INVOICE CHECKER
   AUTHENTICATION CONTROLLER
===================================================== */

const User = require("../models/User");


/* =====================================================
   REGISTER USER
===================================================== */

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            phone,
            company
        } = req.body;


        /* Check required fields */

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });

        }


        /* Check existing user */

        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });


        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "Email already registered."
            });

        }


        /* Create user */

        const user =
            await User.create({

                name: name.trim(),

                email: email
                    .trim()
                    .toLowerCase(),

                password: password,

                phone: phone || "",

                company: company || "",

                createdAt: new Date()

            });


        return res.status(201).json({

            success: true,

            message: "Registration successful.",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                phone: user.phone,

                company: user.company

            }

        });


    } catch (error) {

        console.error(
            "Registration Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Server error during registration."

        });

    }

};


/* =====================================================
   LOGIN USER
===================================================== */

const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        /* Check fields */

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        /* Find user */

        const user =
            await User.findOne({

                email: email
                    .trim()
                    .toLowerCase()

            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        /* Check password */

        if (user.password !== password) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        /* Login successful */

        return res.status(200).json({

            success: true,

            message: "Login successful.",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                phone: user.phone || "",

                company: user.company || ""

            }

        });


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during login."

        });

    }

};


/* =====================================================
   CHANGE PASSWORD
===================================================== */

const changePassword = async (req, res) => {

    try {

        const {
            email,
            currentPassword,
            newPassword
        } = req.body;


        /* Check fields */

        if (
            !email ||
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email, current password and new password are required."

            });

        }


        /* Validate new password */

        if (newPassword.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must contain at least 6 characters."

            });

        }


        /* Find user */

        const user =
            await User.findOne({

                email: email
                    .trim()
                    .toLowerCase()

            });


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        /* Check current password */

        if (
            user.password !== currentPassword
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Current password is incorrect."

            });

        }


        /* Update password */

        user.password =
            newPassword;


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Password updated successfully."

        });


    } catch (error) {

        console.error(
            "Change Password Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error while changing password."

        });

    }

};


/* =====================================================
   EXPORT CONTROLLERS
===================================================== */

module.exports = {

    registerUser,

    loginUser,

    changePassword

};