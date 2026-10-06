/* =====================================================
   AI INVOICE CHECKER
   BACKEND SERVER
===================================================== */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();


/* =====================================================
   IMPORT DATABASE
===================================================== */

const connectDB = require("./config/db");


/* =====================================================
   IMPORT ROUTES
===================================================== */

const authRoutes =
    require("./routes/authRoutes");

const invoiceRoutes =
    require("./routes/invoiceRoutes");


/* =====================================================
   CREATE EXPRESS APP
===================================================== */

const app = express();


/* =====================================================
   PORT
===================================================== */

const PORT =
    process.env.PORT || 5000;


/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =====================================================
   DATABASE
===================================================== */

connectDB();


/* =====================================================
   ROUTES
===================================================== */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/invoices",
    invoiceRoutes
);


/* =====================================================
   HOME
===================================================== */

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "AI Invoice Checker Backend is Running!"

    });

});


/* =====================================================
   HEALTH CHECK
===================================================== */

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            server:
                "AI Invoice Checker",

            status:
                "Running",

            database:
                "MongoDB",

            port:
                PORT

        });

    }
);


/* =====================================================
   404 ROUTE
===================================================== */

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API route not found",

            path:
                req.originalUrl

        });

    }
);


/* =====================================================
   ERROR HANDLER
===================================================== */

app.use(
    (err, req, res, next) => {

        console.error(err);

        res.status(500).json({

            success: false,

            message:
                err.message ||
                "Internal server error"

        });

    }
);


/* =====================================================
   START SERVER
===================================================== */

app.listen(
    PORT,
    () => {

        console.log(
            "========================================="
        );

        console.log(
            "       AI INVOICE CHECKER BACKEND"
        );

        console.log(
            "========================================="
        );

        console.log(
            `Server running on http://localhost:${PORT}`
        );

        console.log(
            `Health check: http://localhost:${PORT}/api/health`
        );

        console.log(
            "========================================="
        );

    }
);