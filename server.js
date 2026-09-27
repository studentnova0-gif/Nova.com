// ============================================================
// NOVA COLLEGE
// COMPLETE SECURE SERVER
// Part 1 — Configuration + Models + Helpers
// ============================================================

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const path = require("path");

// ============================================================
// APP CONFIGURATION
// ============================================================

const app = express();

const PORT = Number(process.env.PORT || 5000);

const NODE_ENV = String(
    process.env.NODE_ENV || "development"
)
    .trim()
    .toLowerCase();

const PUBLIC_DIR = path.join(
    __dirname,
    "public"
);

// ============================================================
// ENVIRONMENT VARIABLES
// ============================================================

const MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/nova_college";

const LAN_IP =
    String(
        process.env.LAN_IP || "127.0.0.1"
    ).trim();

const FRONTEND_ORIGIN =
    String(
        process.env.FRONTEND_ORIGIN || ""
    ).trim();

const JWT_SECRET =
    process.env.JWT_SECRET ||
    crypto.randomBytes(32).toString("hex");

const ADMIN_TOKEN_SECRET =
    process.env.ADMIN_TOKEN_SECRET ||
    crypto.randomBytes(32).toString("hex");

const ADMIN_EMAIL =
    String(
        process.env.ADMIN_EMAIL ||
            "studentnova0@gmail.com"
    )
        .trim()
        .toLowerCase();

const ADMIN_PASSWORD =
    String(
        process.env.ADMIN_PASSWORD || ""
    ).trim();

const ADMISSION_FEE = Number(
    process.env.ADMISSION_FEE || 5000
);

const RESET_BASE_URL =
    String(
        process.env.RESET_BASE_URL ||
            `http://localhost:${PORT}`
    )
        .trim()
        .replace(/\/+$/, "");

const EMAIL_USER =
    String(
        process.env.EMAIL_USER || ""
    ).trim();

const EMAIL_APP_PASSWORD =
    String(
        process.env.EMAIL_APP_PASSWORD || ""
    ).trim();

const SMTP_HOST =
    String(
        process.env.SMTP_HOST ||
            "smtp.gmail.com"
    ).trim();

const SMTP_PORT = Number(
    process.env.SMTP_PORT || 587
);

const SMTP_SECURE =
    String(
        process.env.SMTP_SECURE || "false"
    ).toLowerCase() === "true";

// ============================================================
// HELPERS
// ============================================================

function cleanString(value) {
    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value).trim();
}

function normalizeEmail(value) {
    return cleanString(value).toLowerCase();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );
}

function safeText(value) {
    return cleanString(value)
        .replace(/[<>]/g, "");
}

function generateStudentId() {
    const year =
        new Date().getFullYear();

    const randomNumber =
        Math.floor(
            100000 +
                Math.random() * 900000
        );

    return `NOVA-${year}-${randomNumber}`;
}

function generateResetToken() {
    return crypto
        .randomBytes(32)
        .toString("hex");
}

function hashResetToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

// ============================================================
// STUDENT MODEL
// ============================================================

const studentSchema =
    new mongoose.Schema(
        {
            studentId: {
                type: String,
                required: true,
                unique: true,
                index: true
            },

            name: {
                type: String,
                required: true,
                trim: true
            },

            email: {
                type: String,
                required: true,
                lowercase: true,
                trim: true
            },

            password: {
                type: String,
                required: true
            },

            phone: {
                type: String,
                default: ""
            },

            course: {
                type: String,
                default: ""
            },

            status: {
                type: String,
                enum: [
                    "Active",
                    "Inactive"
                ],
                default: "Active"
            },

            admissionStatus: {
                type: String,
                enum: [
                    "Pending",
                    "Approved",
                    "Rejected"
                ],
                default: "Pending"
            },

            resetPasswordToken: {
                type: String,
                default: null
            },

            resetPasswordExpires: {
                type: Date,
                default: null
            }
        },
        {
            timestamps: true,
            collection: "students"
        }
    );

const Student =
    mongoose.model(
        "Student",
        studentSchema
    );

// ============================================================
// STUDENT INFORMATION MODEL
// ============================================================

const studentInformationSchema =
    new mongoose.Schema(
        {
            studentId: {
                type: String,
                required: true,
                unique: true,
                index: true
            },

            email: {
                type: String,
                default: ""
            },

            phone: {
                type: String,
                default: ""
            },

            course: {
                type: String,
                default: ""
            },

            fatherName: {
                type: String,
                default: ""
            },

            dateOfBirth: {
                type: String,
                default: ""
            },

            gender: {
                type: String,
                default: ""
            },

            address: {
                type: String,
                default: ""
            },

            city: {
                type: String,
                default: ""
            },

            admissionStatus: {
                type: String,
                enum: [
                    "Pending",
                    "Approved",
                    "Rejected"
                ],
                default: "Pending"
            },

            feeBalance: {
                type: Number,
                default: ADMISSION_FEE,
                min: 0
            },

            attendance: {
                type: String,
                default: "0%"
            },

            gpa: {
                type: String,
                default: ""
            },

            className: {
                type: String,
                default: ""
            },

            section: {
                type: String,
                default: ""
            },

            rollNumber: {
                type: String,
                default: ""
            },

            marks: {
                type: mongoose.Schema.Types.Mixed,
                default: {}
            },

            notes: {
                type: String,
                default: ""
            }
        },
        {
            timestamps: true,
            collection: "student information"
        }
    );

const StudentInformation =
    mongoose.model(
        "StudentInformation",
        studentInformationSchema
    );

// ============================================================
// PAYMENT MODEL
// ============================================================

const paymentSchema =
    new mongoose.Schema(
        {
            studentId: {
                type: String,
                required: true,
                index: true
            },

            studentName: {
                type: String,
                required: true
            },

            email: {
                type: String,
                required: true
            },

            amount: {
                type: Number,
                required: true,
                min: ADMISSION_FEE
            },

            paymentMethod: {
                type: String,
                enum: ["bank"],
                default: "bank"
            },

            transactionId: {
                type: String,
                required: true,
                unique: true,
                trim: true
            },

            bankName: {
                type: String,
                default: "Meezan Bank"
            },

            status: {
                type: String,
                enum: [
                    "Pending",
                    "Approved",
                    "Rejected"
                ],
                default: "Pending"
            },

            notes: {
                type: String,
                default: ""
            },

            approvedAt: {
                type: Date,
                default: null
            }
        },
        {
            timestamps: true,
            collection: "payments"
        }
    );

const Payment =
    mongoose.model(
        "Payment",
        paymentSchema
    );

// ============================================================
// ADMIN MODEL
// ============================================================

const adminSchema =
    new mongoose.Schema(
        {
            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true
            },

            password: {
                type: String,
                required: true
            },

            role: {
                type: String,
                default: "admin"
            }
        },
        {
            timestamps: true,
            collection: "admins"
        }
    );

const Admin =
    mongoose.model(
        "Admin",
        adminSchema
    );

// ============================================================
// END OF PART 1
// ============================================================
// ============================================================
// PART 2 — MAILER + SECURITY + AUTHENTICATION
// ============================================================

// ============================================================
// GMAIL PASSWORD RESET MAILER
// ============================================================

let transporter = null;

if (
    EMAIL_USER &&
    EMAIL_APP_PASSWORD
) {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_APP_PASSWORD
        }
    });
}

// ============================================================
// VERIFY GMAIL CONNECTION
// ============================================================

async function verifyMailer() {
    if (!transporter) {
        console.warn(
            "Gmail mailer is not configured. Check EMAIL_USER and EMAIL_APP_PASSWORD."
        );
        return false;
    }

    try {
        await transporter.verify();

        console.log(
            "Gmail SMTP connection verified."
        );

        return true;
    } catch (error) {
        console.error(
            "Gmail SMTP verification failed:",
            error.message
        );

        return false;
    }
}

// ============================================================
// SEND PASSWORD RESET EMAIL
// ============================================================

async function sendPasswordResetEmail(
    student,
    rawToken
) {
    if (!transporter) {
        throw new Error(
            "Email service is not configured."
        );
    }

    const resetLink =
        `${RESET_BASE_URL}/reset-password.html?token=${encodeURIComponent(
            rawToken
        )}`;

    const subject =
        "Nova College - Reset Your Password";

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Nova College Password Reset</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f4f6f8;
    font-family:Arial,sans-serif;
">

    <div style="
        max-width:600px;
        margin:30px auto;
        background:#ffffff;
        padding:30px;
        border-radius:12px;
        box-shadow:0 5px 20px rgba(0,0,0,.08);
    ">

        <h2 style="
            margin-top:0;
            color:#111111;
        ">
            Nova College
        </h2>

        <p>
            Hello ${safeText(student.name)},
        </p>

        <p>
            We received a request to reset your
            Nova College student account password.
        </p>

        <p>
            Click the button below to create a
            new password.
        </p>

        <div style="
            text-align:center;
            margin:30px 0;
        ">

            <a href="${resetLink}" style="
                display:inline-block;
                padding:13px 24px;
                background:#000000;
                color:#ffffff;
                text-decoration:none;
                border-radius:7px;
                font-weight:bold;
            ">
                Reset Password
            </a>

        </div>

        <p style="
            font-size:13px;
            color:#666666;
        ">
            This password reset link will expire
            in 1 hour.
        </p>

        <p style="
            font-size:13px;
            color:#666666;
        ">
            If you did not request this password
            reset, you can safely ignore this email.
        </p>

        <hr style="
            border:0;
            border-top:1px solid #eeeeee;
            margin:25px 0;
        ">

        <p style="
            font-size:12px;
            color:#888888;
        ">
            Nova College
        </p>

    </div>

</body>
</html>
`;

    const text = `
Nova College Password Reset

Hello ${student.name},

We received a request to reset your Nova College student account password.

Use this link to reset your password:

${resetLink}

This link will expire in 1 hour.

If you did not request this reset, you can safely ignore this email.

Nova College
`;

    const result =
        await transporter.sendMail({
            from: `"Nova College" <${EMAIL_USER}>`,
            to: student.email,
            subject,
            text,
            html
        });

    console.log(
        "Password reset email sent:",
        result.messageId
    );

    return result;
}

// ============================================================
// SECURITY
// ============================================================

app.disable(
    "x-powered-by"
);

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    })
);

// ============================================================
// CORS
// ============================================================

const allowedOrigins =
    new Set(
        [
            FRONTEND_ORIGIN,

            `http://localhost:${PORT}`,

            `http://127.0.0.1:${PORT}`,

            `http://${LAN_IP}:${PORT}`
        ].filter(Boolean)
    );

app.use(
    cors({
        origin: function (
            origin,
            callback
        ) {
            if (!origin) {
                return callback(
                    null,
                    true
                );
            }

            if (
                allowedOrigins.has(
                    origin
                )
            ) {
                return callback(
                    null,
                    true
                );
            }

            return callback(
                new Error(
                    "CORS origin not allowed."
                )
            );
        },

        credentials: true
    })
);

// ============================================================
// BODY PARSERS
// ============================================================

app.use(
    express.json({
        limit: "2mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "2mb"
    })
);

// ============================================================
// API CACHE CONTROL
// ============================================================

app.use(
    "/api",
    (req, res, next) => {
        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );

        res.setHeader(
            "Pragma",
            "no-cache"
        );

        res.setHeader(
            "Expires",
            "0"
        );

        next();
    }
);

// ============================================================
// RATE LIMITERS
// ============================================================

const apiLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        max: 200,

        standardHeaders: true,

        legacyHeaders: false,

        message: {
            success: false,
            message:
                "Too many requests. Please try again later."
        }
    });

const authLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        max: 10,

        standardHeaders: true,

        legacyHeaders: false,

        message: {
            success: false,
            message:
                "Too many login attempts. Please try again later."
        }
    });

const registrationLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        max: 20,

        standardHeaders: true,

        legacyHeaders: false,

        message: {
            success: false,
            message:
                "Too many registration attempts. Please try again later."
        }
    });

const paymentLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        max: 20,

        standardHeaders: true,

        legacyHeaders: false,

        message: {
            success: false,
            message:
                "Too many payment requests. Please try again later."
        }
    });

app.use(
    "/api",
    apiLimiter
);

// ============================================================
// SIMPLE COOKIE PARSER
// ============================================================

app.use(
    (req, res, next) => {
        req.cookies = {};

        const cookieHeader =
            req.headers.cookie;

        if (cookieHeader) {
            cookieHeader
                .split(";")
                .forEach(
                    (cookie) => {
                        const index =
                            cookie.indexOf(
                                "="
                            );

                        if (
                            index === -1
                        ) {
                            return;
                        }

                        const key =
                            cookie
                                .slice(
                                    0,
                                    index
                                )
                                .trim();

                        const value =
                            cookie
                                .slice(
                                    index + 1
                                )
                                .trim();

                        try {
                            req.cookies[
                                key
                            ] =
                                decodeURIComponent(
                                    value
                                );
                        } catch {
                            req.cookies[
                                key
                            ] = value;
                        }
                    }
                );
        }

        next();
    }
);

// ============================================================
// TOKEN HELPERS
// ============================================================

function getBearerToken(req) {
    const authorization =
        req.headers.authorization;

    if (
        !authorization ||
        !authorization.startsWith(
            "Bearer "
        )
    ) {
        return null;
    }

    return authorization
        .slice(7)
        .trim();
}

// ============================================================
// ADMIN TOKEN
// ============================================================

function getAdminTokenFromRequest(
    req
) {
    return (
        req.cookies
            ?.nova_admin_session ||

        getBearerToken(req) ||

        req.headers[
            "x-admin-token"
        ] ||

        null
    );
}

// ============================================================
// STUDENT TOKEN
// ============================================================

function getStudentTokenFromRequest(
    req
) {
    return (
        req.cookies
            ?.nova_student_session ||

        getBearerToken(req) ||

        req.headers[
            "x-student-token"
        ] ||

        null
    );
}

// ============================================================
// CREATE ADMIN TOKEN
// ============================================================

function createAdminToken(
    admin
) {
    return jwt.sign(
        {
            type: "admin",

            adminId:
                String(admin._id),

            email:
                admin.email,

            role:
                admin.role || "admin"
        },

        ADMIN_TOKEN_SECRET,

        {
            expiresIn: "12h"
        }
    );
}

// ============================================================
// CREATE STUDENT TOKEN
// ============================================================

function createStudentToken(
    student
) {
    return jwt.sign(
        {
            type: "student",

            studentId:
                student.studentId,

            email:
                student.email
        },

        JWT_SECRET,

        {
            expiresIn: "7d"
        }
    );
}

// ============================================================
// COOKIE OPTIONS
// ============================================================

function authCookieOptions(
    maxAge
) {
    return {
        httpOnly: true,

        secure:
            NODE_ENV ===
            "production",

        sameSite: "lax",

        path: "/",

        maxAge
    };
}

// ============================================================
// VERIFY ADMIN TOKEN
// ============================================================

function verifyAdminToken(
    token
) {
    if (!token) {
        return null;
    }

    try {
        const decoded =
            jwt.verify(
                token,
                ADMIN_TOKEN_SECRET
            );

        if (
            decoded.type !==
            "admin"
        ) {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
}

// ============================================================
// VERIFY STUDENT TOKEN
// ============================================================

function verifyStudentToken(
    token
) {
    if (!token) {
        return null;
    }

    try {
        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        if (
            decoded.type !==
            "student"
        ) {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
}

// ============================================================
// REQUIRE STUDENT AUTHENTICATION
// ============================================================

async function requireStudent(
    req,
    res,
    next
) {
    try {
        const token =
            getStudentTokenFromRequest(
                req
            );

        const decoded =
            verifyStudentToken(
                token
            );

        if (!decoded) {
            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        "Student authentication required."
                });
        }

        const student =
            await Student.findOne({
                studentId:
                    decoded.studentId
            });

        if (!student) {
            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        "Student account not found."
                });
        }

        req.student =
            student;

        req.studentToken =
            decoded;

        next();
    } catch (error) {
        next(error);
    }
}

// ============================================================
// REQUIRE ADMIN AUTHENTICATION
// ============================================================

async function requireAdmin(
    req,
    res,
    next
) {
    try {
        const token =
            getAdminTokenFromRequest(
                req
            );

        const decoded =
            verifyAdminToken(
                token
            );

        if (!decoded) {
            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        "Admin authentication required."
                });
        }

        const admin =
            await Admin.findById(
                decoded.adminId
            ).select(
                "-password"
            );

        if (!admin) {
            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        "Admin account not found."
                });
        }

        req.admin =
            admin;

        req.adminToken =
            decoded;

        next();
    } catch (error) {
        next(error);
    }
}

// ============================================================
// PROTECTED ADMIN PAGE
// ============================================================

async function requireAdminPage(
    req,
    res,
    next
) {
    try {
        const token =
            getAdminTokenFromRequest(
                req
            );

        const decoded =
            verifyAdminToken(
                token
            );

        if (!decoded) {
            return res.redirect(
                "/admin-login.html"
            );
        }

        const admin =
            await Admin.findById(
                decoded.adminId
            );

        if (!admin) {
            return res.redirect(
                "/admin-login.html"
            );
        }

        req.admin =
            admin;

        next();
    } catch {
        return res.redirect(
            "/admin-login.html"
        );
    }
}

// ============================================================
// END OF PART 2
// ============================================================
// ============================================================
// PART 3 — STUDENT HELPERS + STUDENT APIs + RESET + PAYMENTS
// ============================================================

// ============================================================
// GET OR CREATE STUDENT INFORMATION
// ============================================================

async function getOrCreateStudentInformation(
    student
) {
    let information =
        await StudentInformation.findOne({
            studentId:
                student.studentId
        });

    if (!information) {
        information =
            await StudentInformation.create({
                studentId:
                    student.studentId,

                email:
                    student.email,

                phone:
                    student.phone || "",

                course:
                    student.course || "",

                admissionStatus:
                    student.admissionStatus ||
                    "Pending",

                feeBalance:
                    ADMISSION_FEE,

                attendance:
                    "0%"
            });
    }

    return information;
}

// ============================================================
// SYNC STUDENT INFORMATION
// ============================================================

async function syncStudentInformation(
    student
) {
    let information =
        await StudentInformation.findOne({
            studentId:
                student.studentId
        });

    if (!information) {
        information =
            await StudentInformation.create({
                studentId:
                    student.studentId,

                email:
                    student.email,

                phone:
                    student.phone || "",

                course:
                    student.course || "",

                admissionStatus:
                    student.admissionStatus ||
                    "Pending",

                feeBalance:
                    ADMISSION_FEE,

                attendance:
                    "0%"
            });

        return information;
    }

    information.email =
        student.email;

    information.phone =
        student.phone || "";

    information.course =
        student.course || "";

    information.admissionStatus =
        student.admissionStatus ||
        "Pending";

    await information.save();

    return information;
}

// ============================================================
// UPDATE STUDENT BALANCE
// ============================================================

async function updateStudentBalance(
    studentId
) {
    const information =
        await StudentInformation.findOne({
            studentId
        });

    if (!information) {
        return null;
    }

    const payments =
        await Payment.find({
            studentId,
            status: "Approved"
        }).lean();

    const totalApproved =
        payments.reduce(
            (total, payment) =>
                total +
                Number(
                    payment.amount || 0
                ),
            0
        );

    information.feeBalance =
        Math.max(
            0,
            ADMISSION_FEE -
                totalApproved
        );

    await information.save();

    return information;
}

// ============================================================
// REPAIR STUDENT DATA
// ============================================================

async function repairStudentData() {
    const students =
        await Student.find({})
            .select(
                "studentId email phone course admissionStatus"
            )
            .lean();

    let repaired = 0;

    for (
        const student of students
    ) {
        const existing =
            await StudentInformation.findOne({
                studentId:
                    student.studentId
            });

        if (!existing) {
            await StudentInformation.create({
                studentId:
                    student.studentId,

                email:
                    student.email || "",

                phone:
                    student.phone || "",

                course:
                    student.course || "",

                admissionStatus:
                    student.admissionStatus ||
                    "Pending",

                feeBalance:
                    ADMISSION_FEE,

                attendance:
                    "0%"
            });

            repaired++;
        }
    }

    return repaired;
}

// ============================================================
// API TEST
// ============================================================

app.get(
    "/api/test",
    (req, res) => {
        return res.json({
            success: true,
            message:
                "Nova College API is working.",
            time:
                new Date().toISOString()
        });
    }
);

// ============================================================
// API HEALTH
// ============================================================

app.get(
    "/api/health",
    async (req, res) => {
        const mongoReady =
            mongoose.connection.readyState ===
            1;

        return res.status(
            mongoReady ? 200 : 503
        ).json({
            success:
                mongoReady,

            server:
                "running",

            database:
                mongoReady
                    ? "connected"
                    : "disconnected",

            time:
                new Date().toISOString()
        });
    }
);

// ============================================================
// BANK PAYMENT DETAILS
// ============================================================

app.get(
    "/api/payment/bank-details",
    (req, res) => {
        return res.json({
            success: true,

            paymentMethod:
                "bank",

            admissionFee:
                ADMISSION_FEE,

            bank: {
                bankName:
                    "Meezan Bank",

                accountTitle:
                    "Nova College of Science",

                accountNumber:
                    process.env.BANK_ACCOUNT_NUMBER ||
                    "",

                iban:
                    process.env.BANK_IBAN ||
                    ""
            }
        });
    }
);

// ============================================================
// STUDENT REGISTRATION
// ============================================================

app.post(
    "/api/register",
    registrationLimiter,

    async (req, res, next) => {
        try {
            const name =
                cleanString(
                    req.body.name
                );

            const email =
                normalizeEmail(
                    req.body.email
                );

            const password =
                cleanString(
                    req.body.password
                );

            const phone =
                cleanString(
                    req.body.phone
                );

            const course =
                cleanString(
                    req.body.course
                );

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Name is required."
                });
            }

            if (
                !email ||
                !isValidEmail(email)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Valid email address is required."
                });
            }

            if (
                password.length < 6
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password must contain at least 6 characters."
                });
            }

            const existing =
                await Student.findOne({
                    email
                });

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message:
                        "A student with this email already exists."
                });
            }

            let studentId;

            for (let i = 0; i < 10; i++) {
                const candidate =
                    generateStudentId();

                const exists =
                    await Student.findOne({
                        studentId:
                            candidate
                    });

                if (!exists) {
                    studentId =
                        candidate;
                    break;
                }
            }

            if (!studentId) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to generate Student ID."
                });
            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    12
                );

            const student =
                await Student.create({
                    studentId,

                    name,

                    email,

                    password:
                        hashedPassword,

                    phone,

                    course,

                    status:
                        "Active",

                    admissionStatus:
                        "Pending"
                });

            await getOrCreateStudentInformation(
                student
            );

            const token =
                createStudentToken(
                    student
                );

            res.cookie(
                "nova_student_session",
                token,
                authCookieOptions(
                    7 * 24 * 60 * 60 * 1000
                )
            );

            return res.status(201).json({
                success: true,

                message:
                    "Registration successful.",

                token,

                student: {
                    studentId:
                        student.studentId,

                    name:
                        student.name,

                    email:
                        student.email,

                    phone:
                        student.phone,

                    course:
                        student.course,

                    status:
                        student.status,

                    admissionStatus:
                        student.admissionStatus
                },

                data: {
                    studentId:
                        student.studentId
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// STUDENT LOGIN
// ============================================================

app.post(
    "/api/login",
    authLimiter,

    async (req, res, next) => {
        try {
            const identifier =
                cleanString(
                    req.body.studentId ||
                    req.body.email ||
                    req.body.identifier
                );

            const password =
                cleanString(
                    req.body.password
                );

            if (!identifier) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Student ID or email is required."
                });
            }

            if (!password) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password is required."
                });
            }

            const query =
                identifier.includes("@")
                    ? {
                          email:
                              normalizeEmail(
                                  identifier
                              )
                      }
                    : {
                          studentId:
                              identifier
                      };

            const student =
                await Student.findOne(
                    query
                );

            if (!student) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid Student ID/email or password."
                });
            }

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    student.password
                );

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid Student ID/email or password."
                });
            }

            const token =
                createStudentToken(
                    student
                );

            res.cookie(
                "nova_student_session",
                token,
                authCookieOptions(
                    7 * 24 * 60 * 60 * 1000
                )
            );

            return res.json({
                success: true,

                message:
                    "Student login successful.",

                token,

                student: {
                    studentId:
                        student.studentId,

                    name:
                        student.name,

                    email:
                        student.email,

                    phone:
                        student.phone,

                    course:
                        student.course,

                    status:
                        student.status,

                    admissionStatus:
                        student.admissionStatus
                },

                data: {
                    studentId:
                        student.studentId
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// STUDENT ME
// ============================================================

app.get(
    "/api/student/me",
    requireStudent,

    async (req, res) => {
        return res.json({
            success: true,

            authenticated:
                true,

            student: {
                studentId:
                    req.student.studentId,

                name:
                    req.student.name,

                email:
                    req.student.email,

                phone:
                    req.student.phone,

                course:
                    req.student.course,

                status:
                    req.student.status,

                admissionStatus:
                    req.student.admissionStatus
            }
        });
    }
);

// ============================================================
// STUDENT AUTH CHECK
// ============================================================

app.get(
    "/api/student/auth-check",
    requireStudent,

    async (req, res) => {
        return res.json({
            success: true,

            authenticated:
                true,

            studentId:
                req.student.studentId
        });
    }
);

// ============================================================
// STUDENT DASHBOARD API
// ============================================================

app.get(
    "/api/student/dashboard",
    requireStudent,

    async (req, res, next) => {
        try {
            const information =
                await getOrCreateStudentInformation(
                    req.student
                );

            const payments =
                await Payment.find({
                    studentId:
                        req.student.studentId
                })
                    .sort({
                        createdAt: -1
                    })
                    .lean();

            return res.json({
                success: true,

                student: {
                    studentId:
                        req.student.studentId,

                    name:
                        req.student.name,

                    email:
                        req.student.email,

                    phone:
                        req.student.phone,

                    course:
                        req.student.course,

                    status:
                        req.student.status,

                    admissionStatus:
                        req.student.admissionStatus
                },

                information,

                payments,

                data: {
                    student: req.student,
                    information,
                    payments
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// STUDENT INFORMATION
// ============================================================

app.get(
    "/api/student/information",
    requireStudent,

    async (req, res, next) => {
        try {
            const information =
                await getOrCreateStudentInformation(
                    req.student
                );

            return res.json({
                success: true,

                information,

                data:
                    information
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// STUDENT PAYMENTS
// ============================================================

app.get(
    "/api/student/payments",
    requireStudent,

    async (req, res, next) => {
        try {
            const payments =
                await Payment.find({
                    studentId:
                        req.student.studentId
                })
                    .sort({
                        createdAt: -1
                    })
                    .lean();

            return res.json({
                success: true,

                payments,

                data:
                    payments
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// STUDENT LOGOUT
// ============================================================

app.post(
    "/api/logout",
    (req, res) => {
        res.clearCookie(
            "nova_student_session",
            {
                httpOnly: true,
                sameSite: "lax",
                secure:
                    NODE_ENV ===
                    "production",
                path: "/"
            }
        );

        res.clearCookie(
            "nova_admin_session",
            {
                httpOnly: true,
                sameSite: "lax",
                secure:
                    NODE_ENV ===
                    "production",
                path: "/"
            }
        );

        return res.json({
            success: true,
            message:
                "Logged out successfully."
        });
    }
);

app.post(
    "/api/student/logout",
    (req, res) => {
        res.clearCookie(
            "nova_student_session",
            {
                httpOnly: true,
                sameSite: "lax",
                secure:
                    NODE_ENV ===
                    "production",
                path: "/"
            }
        );

        return res.json({
            success: true,
            message:
                "Student logged out successfully."
        });
    }
);

// ============================================================
// FORGOT PASSWORD
// ============================================================

app.post(
    "/api/forgot-password",
    authLimiter,

    async (req, res, next) => {
        try {
            const identifier =
                cleanString(
                    req.body.studentId ||
                    req.body.email
                );

            if (!identifier) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Student ID or email is required."
                });
            }

            const query =
                identifier.includes("@")
                    ? {
                          email:
                              normalizeEmail(
                                  identifier
                              )
                      }
                    : {
                          studentId:
                              identifier
                      };

            const student =
                await Student.findOne(
                    query
                );

            // Do not reveal whether an account
            // exists when the identifier is unknown.
            if (!student) {
                return res.json({
                    success: true,
                    message:
                        "If the account exists, a password reset email has been sent."
                });
            }

            if (!isValidEmail(student.email)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "The student's email address is invalid."
                });
            }

            if (!transporter) {
                console.error(
                    "Password reset requested but Gmail is not configured."
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Email service is not configured on the server."
                });
            }

            const rawToken =
                generateResetToken();

            const hashedToken =
                hashResetToken(
                    rawToken
                );

            student.resetPasswordToken =
                hashedToken;

            student.resetPasswordExpires =
                new Date(
                    Date.now() +
                        60 * 60 * 1000
                );

            await student.save();

            try {
                await sendPasswordResetEmail(
                    student,
                    rawToken
                );
            } catch (emailError) {
                student.resetPasswordToken =
                    null;

                student.resetPasswordExpires =
                    null;

                await student.save();

                console.error(
                    "PASSWORD RESET EMAIL ERROR:",
                    emailError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Password reset email could not be sent.",
                    details:
                        NODE_ENV ===
                        "production"
                            ? undefined
                            : emailError.message
                });
            }

            return res.json({
                success: true,
                message:
                    "Password reset email sent successfully."
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// RESET PASSWORD
// ============================================================

app.post(
    "/api/reset-password",
    authLimiter,

    async (req, res, next) => {
        try {
            const token =
                cleanString(
                    req.body.token
                );

            const newPassword =
                cleanString(
                    req.body.newPassword ||
                    req.body.password
                );

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Reset token is required."
                });
            }

            if (
                newPassword.length < 6
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password must contain at least 6 characters."
                });
            }

            const hashedToken =
                hashResetToken(
                    token
                );

            const student =
                await Student.findOne({
                    resetPasswordToken:
                        hashedToken,

                    resetPasswordExpires: {
                        $gt:
                            new Date()
                    }
                });

            if (!student) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid or expired reset token."
                });
            }

            student.password =
                await bcrypt.hash(
                    newPassword,
                    12
                );

            student.resetPasswordToken =
                null;

            student.resetPasswordExpires =
                null;

            await student.save();

            return res.json({
                success: true,
                message:
                    "Password reset successfully."
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// CREATE BANK PAYMENT
// ============================================================

app.post(
    "/api/payment/create",
    requireStudent,
    paymentLimiter,

    async (req, res, next) => {
        try {
            const amount =
                Number(
                    req.body.amount ||
                    ADMISSION_FEE
                );

            const transactionId =
                cleanString(
                    req.body.transactionId
                );

            const bankName =
                cleanString(
                    req.body.bankName ||
                    "Meezan Bank"
                );

            const notes =
                cleanString(
                    req.body.notes
                );

            if (
                !Number.isFinite(
                    amount
                ) ||
                amount < ADMISSION_FEE
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Payment amount must be at least Rs. ${ADMISSION_FEE}.`
                });
            }

            if (!transactionId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Transaction ID is required."
                });
            }

            const duplicate =
                await Payment.findOne({
                    transactionId
                });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message:
                        "This transaction ID has already been submitted."
                });
            }

            const payment =
                await Payment.create({
                    studentId:
                        req.student.studentId,

                    studentName:
                        req.student.name,

                    email:
                        req.student.email,

                    amount,

                    paymentMethod:
                        "bank",

                    transactionId,

                    bankName,

                    status:
                        "Pending",

                    notes
                });

            return res.status(201).json({
                success: true,

                message:
                    "Bank payment submitted successfully.",

                payment,

                data:
                    payment
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// END OF PART 3
// ============================================================
// ============================================================
// PART 4 — ADMIN + PAGES + 404 + STARTUP
// ============================================================

// ============================================================
// ADMIN LOGIN
// ============================================================

app.post(
    "/api/admin/login",
    authLimiter,

    async (req, res, next) => {
        try {
            const email =
                normalizeEmail(
                    req.body.email
                );

            const password =
                cleanString(
                    req.body.password
                );

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Admin email is required."
                });
            }

            if (!password) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Admin password is required."
                });
            }

            const admin =
                await Admin.findOne({
                    email
                });

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid admin email or password."
                });
            }

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    admin.password
                );

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid admin email or password."
                });
            }

            const token =
                createAdminToken(
                    admin
                );

            res.cookie(
                "nova_admin_session",
                token,
                authCookieOptions(
                    12 * 60 * 60 * 1000
                )
            );

            console.log(
                `ADMIN LOGIN SUCCESS: ${admin.email}`
            );

            return res.json({
                success: true,

                message:
                    "Admin login successful.",

                token,

                adminToken:
                    token,

                admin: {
                    id:
                        String(admin._id),

                    email:
                        admin.email,

                    role:
                        admin.role
                },

                data: {
                    token,
                    adminToken:
                        token
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// ADMIN LOGOUT
// ============================================================

app.post(
    "/api/admin/logout",
    (req, res) => {
        res.clearCookie(
            "nova_admin_session",
            {
                httpOnly: true,
                sameSite: "lax",
                secure:
                    NODE_ENV ===
                    "production",
                path: "/"
            }
        );

        return res.json({
            success: true,
            message:
                "Admin logged out successfully."
        });
    }
);

// ============================================================
// ADMIN ME
// ============================================================

app.get(
    "/api/admin/me",
    requireAdmin,

    async (req, res) => {
        return res.json({
            success: true,

            authenticated:
                true,

            admin: {
                id:
                    String(
                        req.admin._id
                    ),

                email:
                    req.admin.email,

                role:
                    req.admin.role
            }
        });
    }
);

// ============================================================
// ADMIN AUTH CHECK
// ============================================================

app.get(
    "/api/admin/auth-check",
    requireAdmin,

    async (req, res) => {
        return res.json({
            success: true,

            authenticated:
                true,

            admin: {
                id:
                    String(
                        req.admin._id
                    ),

                email:
                    req.admin.email,

                role:
                    req.admin.role
            }
        });
    }
);

// ============================================================
// ADMIN SESSION
// ============================================================

app.get(
    "/api/admin/session",
    requireAdmin,

    async (req, res) => {
        return res.json({
            success: true,

            authenticated:
                true,

            admin: {
                id:
                    String(
                        req.admin._id
                    ),

                email:
                    req.admin.email,

                role:
                    req.admin.role
            }
        });
    }
);

// ============================================================
// ADMIN STATISTICS
// ============================================================

app.get(
    "/api/admin/statistics",
    requireAdmin,

    async (req, res, next) => {
        try {
            const [
                totalStudents,
                activeStudents,
                pendingAdmissions,
                approvedAdmissions,
                totalPayments,
                pendingPayments,
                approvedPayments,
                rejectedPayments
            ] = await Promise.all([
                Student.countDocuments(),

                Student.countDocuments({
                    status:
                        "Active"
                }),

                Student.countDocuments({
                    admissionStatus:
                        "Pending"
                }),

                Student.countDocuments({
                    admissionStatus:
                        "Approved"
                }),

                Payment.countDocuments(),

                Payment.countDocuments({
                    status:
                        "Pending"
                }),

                Payment.countDocuments({
                    status:
                        "Approved"
                }),

                Payment.countDocuments({
                    status:
                        "Rejected"
                })
            ]);

            const approvedAmountResult =
                await Payment.aggregate([
                    {
                        $match: {
                            status:
                                "Approved"
                        }
                    },

                    {
                        $group: {
                            _id: null,

                            total: {
                                $sum:
                                    "$amount"
                            }
                        }
                    }
                ]);

            const pendingAmountResult =
                await Payment.aggregate([
                    {
                        $match: {
                            status:
                                "Pending"
                        }
                    },

                    {
                        $group: {
                            _id: null,

                            total: {
                                $sum:
                                    "$amount"
                            }
                        }
                    }
                ]);

            const approvedAmount =
                Number(
                    approvedAmountResult[0]
                        ?.total || 0
                );

            const pendingAmount =
                Number(
                    pendingAmountResult[0]
                        ?.total || 0
                );

            return res.json({
                success: true,

                statistics: {
                    totalStudents,

                    activeStudents,

                    pendingAdmissions,

                    approvedAdmissions,

                    totalPayments,

                    pendingPayments,

                    approvedPayments,

                    rejectedPayments,

                    approvedAmount,

                    pendingAmount
                },

                data: {
                    totalStudents,

                    activeStudents,

                    pendingAdmissions,

                    approvedAdmissions,

                    totalPayments,

                    pendingPayments,

                    approvedPayments,

                    rejectedPayments,

                    approvedAmount,

                    pendingAmount
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// ADMIN — GET STUDENTS
// ============================================================

app.get(
    "/api/admin/students",
    requireAdmin,

    async (req, res, next) => {
        try {
            const students =
                await Student.find({})
                    .select(
                        "-password -resetPasswordToken -resetPasswordExpires"
                    )
                    .sort({
                        createdAt: -1
                    })
                    .lean();

            return res.json({
                success: true,

                students,

                count:
                    students.length,

                data:
                    students
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// ADMIN — GET STUDENT INFORMATION
// ============================================================

app.get(
    "/api/admin/student-information",
    requireAdmin,

    async (req, res, next) => {
        try {
            const information =
                await StudentInformation.find({})
                    .sort({
                        createdAt: -1
                    })
                    .lean();

            return res.json({
                success: true,

                information,

                count:
                    information.length,

                data:
                    information
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// ADMIN — GET PAYMENTS
// ============================================================

app.get(
    "/api/admin/payments",
    requireAdmin,

    async (req, res, next) => {
        try {
            const payments =
                await Payment.find({})
                    .sort({
                        createdAt: -1
                    })
                    .lean();

            return res.json({
                success: true,

                payments,

                count:
                    payments.length,

                data:
                    payments
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// ADMIN — GET SINGLE STUDENT
// ============================================================

app.get(
    "/api/admin/students/:studentId",
    requireAdmin,

    async (req, res, next) => {
        try {
            const studentId =
                cleanString(
                    req.params.studentId
                );

            const student =
                await Student.findOne({
                    studentId
                })
                    .select(
                        "-password -resetPasswordToken -resetPasswordExpires"
                    )
                    .lean();

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found."
                });
            }

            const information =
                await StudentInformation.findOne({
                    studentId
                }).lean();

            const payments =
                await Payment.find({
                    studentId
                })
                    .sort({
                        createdAt: -1
                    })
                    .lean();

            return res.json({
                success: true,

                student,

                information,

                payments,

                data: {
                    student,
                    information,
                    payments
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// ADMIN — UPDATE STUDENT
// ============================================================

app.put(
    "/api/admin/students/:studentId",
    requireAdmin,

    async (req, res, next) => {
        try {
            const studentId =
                cleanString(
                    req.params.studentId
                );

            const student =
                await Student.findOne({
                    studentId
                });

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found."
                });
            }

            if (
                req.body.name !==
                undefined
            ) {
                const name =
                    cleanString(
                        req.body.name
                    );

                if (!name) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Student name cannot be empty."
                    });
                }

                student.name =
                    name;
            }

            if (
                req.body.email !==
                undefined
            ) {
                const email =
                    normalizeEmail(
                        req.body.email
                    );

                if (
                    !email ||
                    !isValidEmail(email)
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid email address."
                    });
                }

                const duplicate =
                    await Student.findOne({
                        email,

                        _id: {
                            $ne:
                                student._id
                        }
                    });

                if (duplicate) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "Another student already uses this email."
                    });
                }

                student.email =
                    email;
            }

            if (
                req.body.phone !==
                undefined
            ) {
                student.phone =
                    cleanString(
                        req.body.phone
                    );
            }

            if (
                req.body.course !==
                undefined
            ) {
                student.course =
                    cleanString(
                        req.body.course
                    );
            }

            if (
                req.body.status !==
                undefined
            ) {
                const status =
                    cleanString(
                        req.body.status
                    );

                if (
                    [
                        "Active",
                        "Inactive"
                    ].includes(status)
                ) {
                    student.status =
                        status;
                }
            }

            if (
                req.body.admissionStatus !==
                undefined
            ) {
                const admissionStatus =
                    cleanString(
                        req.body.admissionStatus
                    );

                if (
                    [
                        "Pending",
                        "Approved",
                        "Rejected"
                    ].includes(
                        admissionStatus
                    )
                ) {
                    student.admissionStatus =
                        admissionStatus;
                }
            }

            await student.save();

            await syncStudentInformation(
                student
            );

            const result =
                await Student.findById(
                    student._id
                )
                    .select(
                        "-password -resetPasswordToken -resetPasswordExpires"
                    )
                    .lean();

            return res.json({
                success: true,

                message:
                    "Student updated successfully.",

                student:
                    result,

                data:
                    result
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// ADMIN — UPDATE STUDENT INFORMATION
// ============================================================

app.put(
    "/api/admin/student-information/:studentId",
    requireAdmin,

    async (req, res, next) => {
        try {
            const studentId =
                cleanString(
                    req.params.studentId
                );

            const student =
                await Student.findOne({
                    studentId
                });

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found."
                });
            }

            let information =
                await StudentInformation.findOne({
                    studentId
                });

            if (!information) {
                information =
                    await StudentInformation.create({
                        studentId,

                        email:
                            student.email,

                        phone:
                            student.phone || "",

                        course:
                            student.course || "",

                        admissionStatus:
                            student.admissionStatus ||
                            "Pending",

                        feeBalance:
                            ADMISSION_FEE,

                        attendance:
                            "0%"
                    });
            }

            const allowedFields = [
                "email",
                "phone",
                "course",
                "fatherName",
                "dateOfBirth",
                "gender",
                "address",
                "city",
                "admissionStatus",
                "feeBalance",
                "attendance",
                "gpa",
                "className",
                "section",
                "rollNumber",
                "marks",
                "notes"
            ];

            for (
                const field of allowedFields
            ) {
                if (
                    req.body[field] !==
                    undefined
                ) {
                    information[field] =
                        req.body[field];
                }
            }

            if (
                req.body.email !==
                undefined
            ) {
                const email =
                    normalizeEmail(
                        req.body.email
                    );

                if (
                    email &&
                    !isValidEmail(email)
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid email address."
                    });
                }

                information.email =
                    email;
            }

            if (
                req.body.feeBalance !==
                undefined
            ) {
                const balance =
                    Number(
                        req.body.feeBalance
                    );

                if (
                    !Number.isFinite(
                        balance
                    ) ||
                    balance < 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Fee balance must be a valid non-negative number."
                    });
                }

                information.feeBalance =
                    balance;
            }

            await information.save();

            return res.json({
                success: true,

                message:
                    "Student information updated successfully.",

                information,

                data:
                    information
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// ADMIN — RESET STUDENT PASSWORD
// ============================================================

app.post(
    "/api/admin/reset-student-password",
    requireAdmin,

    async (req, res, next) => {
        try {
            const studentId =
                cleanString(
                    req.body.studentId
                );

            const newPassword =
                cleanString(
                    req.body.newPassword ||
                    req.body.password
                );

            if (!studentId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Student ID is required."
                });
            }

            if (
                newPassword.length < 6
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password must contain at least 6 characters."
                });
            }

            const student =
                await Student.findOne({
                    studentId
                });

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found."
                });
            }

            student.password =
                await bcrypt.hash(
                    newPassword,
                    12
                );

            student.resetPasswordToken =
                null;

            student.resetPasswordExpires =
                null;

            await student.save();

            return res.json({
                success: true,
                message:
                    "Student password reset successfully."
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// ADMIN — ADD FEE
// ============================================================

app.post(
    "/api/admin/add-fee",
    requireAdmin,

    async (req, res, next) => {
        try {
            const studentId =
                cleanString(
                    req.body.studentId
                );

            const amount =
                Number(
                    req.body.amount
                );

            const notes =
                cleanString(
                    req.body.notes
                );

            if (!studentId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Student ID is required."
                });
            }

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Fee amount must be greater than zero."
                });
            }

            const student =
                await Student.findOne({
                    studentId
                });

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found."
                });
            }

            const information =
                await getOrCreateStudentInformation(
                    student
                );

            const transactionId =
                `ADMIN-FEE-${Date.now()}-${crypto
                    .randomBytes(4)
                    .toString("hex")
                    .toUpperCase()}`;

            const payment =
                await Payment.create({
                    studentId,

                    studentName:
                        student.name,

                    email:
                        student.email,

                    amount,

                    paymentMethod:
                        "bank",

                    transactionId,

                    bankName:
                        "Admin Fee Entry",

                    status:
                        "Approved",

                    notes:
                        notes ||
                        "Fee added by admin.",

                    approvedAt:
                        new Date()
                });

            information.feeBalance =
                Math.max(
                    0,

                    Number(
                        information.feeBalance ||
                        0
                    ) - amount
                );

            await information.save();

            return res.status(201).json({
                success: true,

                message:
                    "Fee added successfully.",

                payment,

                information
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// ADMIN — UPDATE PAYMENT
// ============================================================

app.put(
    "/api/admin/payments/:id",
    requireAdmin,

    async (req, res, next) => {
        try {
            const payment =
                await Payment.findById(
                    req.params.id
                );

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Payment not found."
                });
            }

            const oldStatus =
                payment.status;

            const oldAmount =
                Number(
                    payment.amount || 0
                );

            if (
                req.body.amount !==
                undefined
            ) {
                const amount =
                    Number(
                        req.body.amount
                    );

                if (
                    !Number.isFinite(
                        amount
                    ) ||
                    amount < ADMISSION_FEE
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            `Payment amount must be at least Rs. ${ADMISSION_FEE}.`
                    });
                }

                payment.amount =
                    amount;
            }

            if (
                req.body.transactionId !==
                undefined
            ) {
                const transactionId =
                    cleanString(
                        req.body.transactionId
                    );

                if (!transactionId) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Transaction ID cannot be empty."
                    });
                }

                const duplicate =
                    await Payment.findOne({
                        transactionId,

                        _id: {
                            $ne:
                                payment._id
                        }
                    });

                if (duplicate) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "Another payment already uses this transaction ID."
                    });
                }

                payment.transactionId =
                    transactionId;
            }

            if (
                req.body.bankName !==
                undefined
            ) {
                payment.bankName =
                    cleanString(
                        req.body.bankName
                    );
            }

            if (
                req.body.notes !==
                undefined
            ) {
                payment.notes =
                    cleanString(
                        req.body.notes
                    );
            }

            if (
                req.body.status !==
                undefined
            ) {
                const status =
                    cleanString(
                        req.body.status
                    );

                if (
                    ![
                        "Pending",
                        "Approved",
                        "Rejected"
                    ].includes(status)
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid payment status."
                    });
                }

                payment.status =
                    status;
            }

            if (
                oldStatus !==
                    "Approved" &&
                payment.status ===
                    "Approved"
            ) {
                payment.approvedAt =
                    new Date();
            }

            if (
                payment.status !==
                "Approved"
            ) {
                payment.approvedAt =
                    null;
            }

            await payment.save();

            await updateStudentBalance(
                payment.studentId
            );

            return res.json({
                success: true,

                message:
                    "Payment updated successfully.",

                payment,

                oldAmount,

                oldStatus,

                data:
                    payment
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// ADMIN — DELETE PAYMENT
// ============================================================

app.delete(
    "/api/admin/payments/:id",
    requireAdmin,

    async (req, res, next) => {
        try {
            const payment =
                await Payment.findById(
                    req.params.id
                );

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Payment not found."
                });
            }

            const studentId =
                payment.studentId;

            await Payment.deleteOne({
                _id:
                    payment._id
            });

            await updateStudentBalance(
                studentId
            );

            return res.json({
                success: true,
                message:
                    "Payment deleted successfully."
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// ADMIN — DELETE STUDENT
// ============================================================

app.delete(
    "/api/admin/students/:studentId",
    requireAdmin,

    async (req, res, next) => {
        try {
            const studentId =
                cleanString(
                    req.params.studentId
                );

            const student =
                await Student.findOne({
                    studentId
                });

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found."
                });
            }

            await Student.deleteOne({
                _id:
                    student._id
            });

            await StudentInformation.deleteOne({
                studentId
            });

            await Payment.deleteMany({
                studentId
            });

            return res.json({
                success: true,
                message:
                    "Student and related information deleted successfully."
            });
        } catch (error) {
            next(error);
        }
    }
);

// ============================================================
// PROTECTED ADMIN DASHBOARD PAGE
// IMPORTANT: BEFORE express.static()
// ============================================================

app.get(
    "/admin-dashboard.html",
    requireAdminPage,

    (req, res) => {
        return res.sendFile(
            path.join(
                PUBLIC_DIR,
                "admin-dashboard.html"
            )
        );
    }
);

// ============================================================
// ADMIN PAGE ALIAS
// ============================================================

app.get(
    "/admin.html",
    requireAdminPage,

    (req, res) => {
        return res.sendFile(
            path.join(
                PUBLIC_DIR,
                "admin-dashboard.html"
            )
        );
    }
);

// ============================================================
// STUDENT DASHBOARD PAGE
// ============================================================

app.get(
    "/dashboard",
    (req, res) => {
        return res.sendFile(
            path.join(
                PUBLIC_DIR,
                "dashboard.html"
            )
        );
    }
);

app.get(
    "/dashboard.html",
    (req, res) => {
        return res.sendFile(
            path.join(
                PUBLIC_DIR,
                "dashboard.html"
            )
        );
    }
);

// ============================================================
// STUDENT LOGIN PAGE
// ============================================================

app.get(
    "/login",
    (req, res) => {
        return res.sendFile(
            path.join(
                PUBLIC_DIR,
                "loginform.html"
            )
        );
    }
);

app.get(
    "/loginform.html",
    (req, res) => {
        return res.sendFile(
            path.join(
                PUBLIC_DIR,
                "loginform.html"
            )
        );
    }
);

// ============================================================
// ADMISSION PAGE
// ============================================================

app.get(
    "/admission",
    (req, res) => {
        return res.sendFile(
            path.join(
                PUBLIC_DIR,
                "admission.html"
            )
        );
    }
);

app.get(
    "/admission.html",
    (req, res) => {
        return res.sendFile(
            path.join(
                PUBLIC_DIR,
                "admission.html"
            )
        );
    }
);

// ============================================================
// RESET PASSWORD PAGE
// ============================================================

app.get(
    "/reset-password",
    (req, res) => {
        return res.sendFile(
            path.join(
                PUBLIC_DIR,
                "reset-password.html"
            )
        );
    }
);

app.get(
    "/reset-password.html",
    (req, res) => {
        return res.sendFile(
            path.join(
                PUBLIC_DIR,
                "reset-password.html"
            )
        );
    }
);

// ============================================================
// ADMIN LOGIN PAGE
// ============================================================

app.get(
    "/admin-login.html",
    (req, res) => {
        return res.sendFile(
            path.join(
                PUBLIC_DIR,
                "admin-login.html"
            )
        );
    }
);

// ============================================================
// STATIC PUBLIC FILES
// ============================================================

app.use(
    express.static(
        PUBLIC_DIR,
        {
            index: "index.html",
            extensions: ["html"]
        }
    )
);

// ============================================================
// ROOT PAGE
// ============================================================

app.get(
    "/",
    (req, res) => {
        return res.sendFile(
            path.join(
                PUBLIC_DIR,
                "index.html"
            )
        );
    }
);

// ============================================================
// API 404
// ============================================================

app.use(
    "/api",
    (req, res) => {
        return res.status(404).json({
            success: false,

            message:
                "API route not found.",

            route:
                req.originalUrl,

            method:
                req.method
        });
    }
);

// ============================================================
// GENERAL 404
// ============================================================

app.use(
    (req, res) => {
        if (
            req.accepts("html")
        ) {
            return res
                .status(404)
                .send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport"
      content="width=device-width,initial-scale=1.0">

<title>Nova College - 404</title>

<style>

body {
    margin: 0;
    min-height: 100vh;

    display: flex;
    align-items: center;
    justify-content: center;

    font-family: Arial, sans-serif;

    background: #f5f5f5;
}

.box {
    background: #ffffff;

    padding: 40px;

    border-radius: 14px;

    text-align: center;

    box-shadow:
        0 10px 35px
        rgba(0,0,0,.10);
}

h1 {
    margin: 0 0 10px;

    font-size: 50px;
}

a {
    display: inline-block;

    margin-top: 20px;

    padding: 11px 20px;

    background: #000000;

    color: #ffffff;

    text-decoration: none;

    border-radius: 7px;
}

</style>
</head>

<body>

<div class="box">

    <h1>404</h1>

    <p>
        The requested Nova College page
        was not found.
    </p>

    <a href="/">
        Home
    </a>

</div>

</body>
</html>
                `);
        }

        return res.status(404).json({
            success: false,

            message:
                "Route not found.",

            route:
                req.originalUrl
        });
    }
);

// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {
        console.error(
            "SERVER ERROR:",
            error
        );

        if (
            error &&
            error.code === 11000
        ) {
            const duplicateFields =
                Object.keys(
                    error.keyPattern ||
                    {}
                );

            return res.status(409).json({
                success: false,

                message:
                    "Duplicate record already exists.",

                fields:
                    duplicateFields
            });
        }

        if (
            error &&
            error.name ===
                "ValidationError"
        ) {
            const validationErrors =
                Object.values(
                    error.errors ||
                    {}
                ).map(
                    (item) =>
                        item.message
                );

            return res.status(400).json({
                success: false,

                message:
                    "Validation error.",

                errors:
                    validationErrors
            });
        }

        return res.status(500).json({
            success: false,

            message:
                "Internal server error.",

            details:
                NODE_ENV ===
                "production"
                    ? undefined
                    : error.message
        });
    }
);

// ============================================================
// REPAIR OLD STUDENT INFORMATION INDEX
// ============================================================

async function repairStudentInformationIndexes() {
    try {
        const collection =
            mongoose.connection.collection(
                "student information"
            );

        const indexes =
            await collection.indexes();

        const emailIndex =
            indexes.find(
                (index) =>
                    index.name ===
                    "email_1"
            );

        if (emailIndex) {
            console.log(
                "Removing old student-information email_1 index..."
            );

            await collection.dropIndex(
                "email_1"
            );

            console.log(
                "Old email_1 index removed."
            );
        }
    } catch (error) {
        if (
            error.codeName !==
            "NamespaceNotFound"
        ) {
            console.error(
                "Index repair warning:",
                error.message
            );
        }
    }
}

// ============================================================
// CREATE DEFAULT ADMIN
// ============================================================

async function ensureAdmin() {
    if (
        !ADMIN_EMAIL ||
        !ADMIN_PASSWORD
    ) {
        console.warn(
            "WARNING: ADMIN_EMAIL or ADMIN_PASSWORD is missing."
        );

        return;
    }

    const email =
        normalizeEmail(
            ADMIN_EMAIL
        );

    let admin =
        await Admin.findOne({
            email
        });

    if (!admin) {
        const hashedPassword =
            await bcrypt.hash(
                ADMIN_PASSWORD,
                12
            );

        admin =
            await Admin.create({
                email,

                password:
                    hashedPassword,

                role:
                    "admin"
            });

        console.log(
            `Default admin account created: ${email}`
        );
    } else {
        console.log(
            `Admin account ready: ${email}`
        );
    }
}

// ============================================================
// START SERVER
// ============================================================

let server = null;

async function startServer() {
    try {
        console.log("");
        console.log(
            "============================================================"
        );
        console.log(
            "        NOVA COLLEGE SERVER STARTING"
        );
        console.log(
            "============================================================"
        );

        console.log(
            `Environment: ${NODE_ENV}`
        );

        console.log(
            `Port: ${PORT}`
        );

        console.log(
            `MongoDB: ${MONGO_URI}`
        );

        console.log(
            "Connecting to MongoDB..."
        );

        await mongoose.connect(
            MONGO_URI,
            {
                serverSelectionTimeoutMS:
                    10000
            }
        );

        console.log(
            `MongoDB connected: ${mongoose.connection.name}`
        );

        await repairStudentInformationIndexes();

        try {
            const repaired =
                await repairStudentData();

            console.log(
                `Student information checked: ${repaired} records repaired.`
            );
        } catch (error) {
            console.error(
                "Student information startup repair warning:",
                error.message
            );
        }

        await ensureAdmin();

        const mailerReady =
            await verifyMailer();

        if (mailerReady) {
            console.log(
                "Password reset email service: READY"
            );
        } else {
            console.log(
                "Password reset email service: NOT CONFIGURED/NOT VERIFIED"
            );
        }

        server =
            app.listen(
                PORT,
                "0.0.0.0",
                () => {
                    console.log("");
                    console.log(
                        "============================================================"
                    );

                    console.log(
                        "        NOVA COLLEGE SERVER RUNNING"
                    );

                    console.log(
                        "============================================================"
                    );

                    console.log(
                        `Local URL:       http://localhost:${PORT}`
                    );

                    console.log(
                        `Local IP:        http://127.0.0.1:${PORT}`
                    );

                    console.log(
                        `Network URL:     http://${LAN_IP}:${PORT}`
                    );

                    console.log("");

                    console.log(
                        `Home:            http://localhost:${PORT}/`
                    );

                    console.log(
                        `Student Login:   http://localhost:${PORT}/loginform.html`
                    );

                    console.log(
                        `Admission:       http://localhost:${PORT}/admission.html`
                    );

                    console.log(
                        `Student Panel:   http://localhost:${PORT}/dashboard.html`
                    );

                    console.log(
                        `Admin Login:     http://localhost:${PORT}/admin-login.html`
                    );

                    console.log(
                        `Admin Panel:     http://localhost:${PORT}/admin-dashboard.html`
                    );

                    console.log(
                        `Password Reset:  http://localhost:${PORT}/reset-password.html`
                    );

                    console.log("");

                    console.log(
                        `API Test:        http://localhost:${PORT}/api/test`
                    );

                    console.log(
                        `API Health:      http://localhost:${PORT}/api/health`
                    );

                    console.log("");

                    console.log(
                        `Admission Fee:   Rs. ${ADMISSION_FEE}`
                    );

                    console.log(
                        "Payment Method:  Bank"
                    );

                    console.log(
                        `Admin Email:     ${ADMIN_EMAIL}`
                    );

                    console.log("");

                    console.log(
                        "============================================================"
                    );

                    console.log(
                        "        SERVER READY"
                    );

                    console.log(
                        "============================================================"
                    );

                    console.log("");
                }
            );
    } catch (error) {
        console.error("");
        console.error(
            "============================================================"
        );

        console.error(
            "        SERVER STARTUP FAILED"
        );

        console.error(
            "============================================================"
        );

        console.error(
            error.message
        );

        console.error("");

        if (
            error.name ===
            "MongooseServerSelectionError"
        ) {
            console.error(
                "MongoDB is not reachable."
            );

            console.error(
                "Make sure MongoDB is running."
            );
        }

        console.error("");

        process.exit(1);
    }
}

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

async function shutdown(
    signal
) {
    console.log(
        `\n${signal} received. Shutting down...`
    );

    try {
        if (server) {
            await new Promise(
                (resolve) => {
                    server.close(
                        resolve
                    );
                }
            );
        }

        await mongoose.connection.close();

        console.log(
            "Nova College server stopped."
        );

        process.exit(0);
    } catch (error) {
        console.error(
            "Shutdown error:",
            error.message
        );

        process.exit(1);
    }
}

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);

// ============================================================
// START
// ============================================================

startServer();