const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

const MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/nova_college";


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
   FRONTEND FILES
===================================================== */

app.use(express.static(__dirname));

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


/* =====================================================
   MAIN WEBSITE PAGE
===================================================== */

app.get("/", (req, res) => {

    const publicIndex = path.join(
        __dirname,
        "public",
        "index.html"
    );

    const rootIndex = path.join(
        __dirname,
        "index.html"
    );

    if (fs.existsSync(publicIndex)) {
        return res.sendFile(publicIndex);
    }

    if (fs.existsSync(rootIndex)) {
        return res.sendFile(rootIndex);
    }

    return res.status(404).send(
        "index.html was not found."
    );
});


/* =====================================================
   STUDENT INFORMATION PAGE
===================================================== */

app.get(
    "/student-information.html",
    (req, res) => {

        const publicFile = path.join(
            __dirname,
            "public",
            "student-information.html"
        );

        const rootFile = path.join(
            __dirname,
            "student-information.html"
        );

        if (fs.existsSync(publicFile)) {
            return res.sendFile(publicFile);
        }

        if (fs.existsSync(rootFile)) {
            return res.sendFile(rootFile);
        }

        return res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Student Information</title>

                <style>
                    body {
                        margin: 0;
                        font-family: Arial, sans-serif;
                        background: #f4f7fb;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                    }

                    .box {
                        width: 90%;
                        max-width: 650px;
                        background: white;
                        padding: 40px;
                        border-radius: 20px;
                        text-align: center;
                        box-shadow:
                            0 15px 40px
                            rgba(0,0,0,.12);
                    }

                    h1 {
                        color: #dc2626;
                    }

                    code {
                        background: #f1f5f9;
                        padding: 10px;
                        border-radius: 8px;
                    }

                    p {
                        font-size: 17px;
                        line-height: 1.6;
                    }
                </style>
            </head>

            <body>

                <div class="box">

                    <h1>
                        Student Information File Not Found
                    </h1>

                    <p>
                        The server is working correctly,
                        but the file
                    </p>

                    <p>
                        <code>
                            student-information.html
                        </code>
                    </p>

                    <p>
                        was not found.
                    </p>

                    <p>
                        Put the file inside your
                        <b>public</b> folder or beside
                        <b>server.js</b>.
                    </p>

                </div>

            </body>
            </html>
        `);
    }
);


/* =====================================================
   STUDENT SCHEMA
===================================================== */

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

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

        phone: {
            type: String,
            default: ""
        },

        course: {
            type: String,
            default: ""
        },

        paymentMethod: {
            type: String,
            default: ""
        },

        amount: {
            type: Number,
            default: 0
        },

        attendance: {
            type: Number,
            default: 0
        },

        gpa: {
            type: Number,
            default: 0
        },

        feeBalance: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);


/* =====================================================
   IMPORTANT:
   USE EXACT MONGODB COLLECTION
===================================================== */

const Student = mongoose.model(
    "Student",
    studentSchema,
    "student information"
);


/* =====================================================
   PAYMENT SCHEMA
===================================================== */

const paymentSchema = new mongoose.Schema(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true
        },

        name: String,

        email: String,

        phone: String,

        course: String,

        amount: Number,

        paymentMethod: String,

        paymentStatus: {
            type: String,
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

const Payment = mongoose.model(
    "Payment",
    paymentSchema
);


/* =====================================================
   TEST API
===================================================== */

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "Backend and MongoDB are working!"
    });

});


/* =====================================================
   ADMISSION / REGISTER
===================================================== */

app.post(
    "/api/register",
    async (req, res) => {

        try {

            let {
                name,
                email,
                password,
                phone,
                course,
                paymentMethod,
                amount
            } = req.body;

            name = String(name || "").trim();

            email = String(email || "")
                .trim()
                .toLowerCase();

            password = String(password || "");

            if (!name || !email || !password) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Name, email and password are required."
                });

            }

            const existingStudent =
                await Student.findOne({
                    email
                });

            if (existingStudent) {

                return res.status(409).json({
                    success: false,
                    message:
                        "A student with this email already exists. Please login instead."
                });

            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const student =
                new Student({

                    name,

                    email,

                    password:
                        hashedPassword,

                    phone:
                        phone || "",

                    course:
                        course || "",

                    paymentMethod:
                        paymentMethod || "",

                    amount:
                        Number(amount) || 0,

                    attendance: 0,

                    gpa: 0,

                    feeBalance:
                        Number(amount) || 0

                });

            await student.save();

            console.log(
                "✅ Student saved:",
                student.email
            );

            return res.status(201).json({

                success: true,

                message:
                    "Admission submitted successfully!",

                redirect:
                    "/loginform.html?registered=1",

                student: {

                    _id:
                        student._id,

                    id:
                        student._id,

                    name:
                        student.name,

                    email:
                        student.email,

                    phone:
                        student.phone,

                    course:
                        student.course

                }

            });

        } catch (error) {

            console.error(
                "❌ Admission error:",
                error
            );

            if (error.code === 11000) {

                return res.status(409).json({
                    success: false,
                    message:
                        "This email is already registered."
                });

            }

            return res.status(500).json({

                success: false,

                message:
                    "Failed to save admission.",

                error:
                    error.message

            });

        }

    }
);


/* =====================================================
   LOGIN
===================================================== */

app.post(
    "/api/login",
    async (req, res) => {

        try {

            let {
                email,
                password
            } = req.body;

            email = String(email || "")
                .trim()
                .toLowerCase();

            password = String(password || "");

            if (!email || !password) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Email and password are required."
                });

            }

            const student =
                await Student.findOne({
                    email
                });

            if (!student) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Email or password is incorrect."
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
                        "Email or password is incorrect."
                });

            }

            console.log(
                "✅ LOGIN SUCCESS:",
                student.email
            );

            return res.json({

                success: true,

                message:
                    "Login successful!",

                student: {

                    _id:
                        student._id,

                    id:
                        student._id,

                    name:
                        student.name,

                    email:
                        student.email,

                    phone:
                        student.phone,

                    course:
                        student.course

                }

            });

        } catch (error) {

            console.error(
                "❌ Login error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Login failed."

            });

        }

    }
);


/* =====================================================
   STUDENT DASHBOARD
===================================================== */

app.get(
    "/api/student/dashboard",
    async (req, res) => {

        try {

            const studentKey =
                String(
                    req.query.student || ""
                ).trim();

            if (!studentKey) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Student information is required."
                });

            }

            let student = null;

            if (
                mongoose.Types.ObjectId
                    .isValid(studentKey)
            ) {

                student =
                    await Student
                        .findById(studentKey)
                        .select("-password");

            }

            if (!student) {

                student =
                    await Student
                        .findOne({
                            email:
                                studentKey
                                    .toLowerCase()
                        })
                        .select("-password");

            }

            if (!student) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found."
                });

            }

            return res.json({

                success: true,

                student: {

                    _id:
                        student._id,

                    id:
                        student._id,

                    name:
                        student.name,

                    email:
                        student.email,

                    phone:
                        student.phone,

                    course:
                        student.course,

                    attendance:
                        Number(
                            student.attendance
                        ) || 0,

                    gpa:
                        Number(
                            student.gpa
                        ) || 0,

                    feeBalance:
                        Number(
                            student.feeBalance
                        ) || 0

                },

                dashboard: {

                    studentId:
                        student._id,

                    name:
                        student.name,

                    email:
                        student.email,

                    phone:
                        student.phone,

                    course:
                        student.course,

                    attendance:
                        Number(
                            student.attendance
                        ) || 0,

                    gpa:
                        Number(
                            student.gpa
                        ) || 0,

                    fees:
                        "Rs. " +
                        (
                            Number(
                                student.feeBalance
                            ) || 0
                        ),

                    courses: [],

                    results: [],

                    notices: []

                }

            });

        } catch (error) {

            console.error(
                "❌ Dashboard error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Could not load dashboard."

            });

        }

    }
);


/* =====================================================
   UPDATE DASHBOARD INFORMATION
===================================================== */

app.put(
    "/api/students/:id/dashboard",
    async (req, res) => {

        try {

            const {
                attendance,
                gpa,
                feeBalance
            } = req.body;

            if (
                !mongoose.Types.ObjectId
                    .isValid(req.params.id)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid student ID."
                });

            }

            const student =
                await Student.findById(
                    req.params.id
                );

            if (!student) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found."
                });

            }

            if (
                attendance !== undefined
            ) {

                student.attendance =
                    Number(attendance);

            }

            if (
                gpa !== undefined
            ) {

                student.gpa =
                    Number(gpa);

            }

            if (
                feeBalance !== undefined
            ) {

                student.feeBalance =
                    Number(feeBalance);

            }

            await student.save();

            return res.json({

                success: true,

                message:
                    "Student dashboard information updated.",

                student: {

                    _id:
                        student._id,

                    name:
                        student.name,

                    email:
                        student.email,

                    attendance:
                        student.attendance,

                    gpa:
                        student.gpa,

                    feeBalance:
                        student.feeBalance

                }

            });

        } catch (error) {

            console.error(
                "❌ Dashboard update error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Could not update student information."

            });

        }

    }
);


/* =====================================================
   STUDENT INFORMATION
   GET ALL
===================================================== */

app.get(
    "/api/student-information",
    async (req, res) => {

        try {

            const students =
                await Student.find()
                    .select("-password")
                    .sort({
                        createdAt: -1
                    });

            return res.json({

                success: true,

                count:
                    students.length,

                students

            });

        } catch (error) {

            console.error(
                "❌ Get students error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Could not retrieve student information.",

                error:
                    error.message

            });

        }

    }
);


/* =====================================================
   STUDENT INFORMATION
   GET ONE
===================================================== */

app.get(
    "/api/student-information/:id",
    async (req, res) => {

        try {

            if (
                !mongoose.Types.ObjectId
                    .isValid(req.params.id)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid student ID."
                });

            }

            const student =
                await Student
                    .findById(req.params.id)
                    .select("-password");

            if (!student) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found."
                });

            }

            return res.json({

                success: true,

                student

            });

        } catch (error) {

            console.error(
                "❌ Get student error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Could not retrieve student.",

                error:
                    error.message

            });

        }

    }
);


/* =====================================================
   STUDENT INFORMATION
   CREATE
===================================================== */

app.post(
    "/api/student-information",
    async (req, res) => {

        try {

            let {
                name,
                email,
                phone,
                course,
                attendance,
                gpa,
                feeBalance
            } = req.body;

            name =
                String(name || "")
                    .trim();

            email =
                String(email || "")
                    .trim()
                    .toLowerCase();

            phone =
                String(phone || "")
                    .trim();

            course =
                String(course || "")
                    .trim();

            if (!name || !email) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Name and email are required."
                });

            }

            const existingStudent =
                await Student.findOne({
                    email
                });

            if (existingStudent) {

                return res.status(409).json({
                    success: false,
                    message:
                        "A student with this email already exists."
                });

            }

            const defaultPassword =
                await bcrypt.hash(
                    "Nova@123",
                    10
                );

            const student =
                new Student({

                    name,

                    email,

                    password:
                        defaultPassword,

                    phone,

                    course,

                    attendance:
                        Number(attendance) || 0,

                    gpa:
                        Number(gpa) || 0,

                    feeBalance:
                        Number(feeBalance) || 0,

                    amount:
                        Number(feeBalance) || 0

                });

            await student.save();

            console.log(
                "✅ Student information created:",
                student.email
            );

            return res.status(201).json({

                success: true,

                message:
                    "Student information added successfully.",

                student: {

                    _id:
                        student._id,

                    id:
                        student._id,

                    name:
                        student.name,

                    email:
                        student.email,

                    phone:
                        student.phone,

                    course:
                        student.course,

                    attendance:
                        student.attendance,

                    gpa:
                        student.gpa,

                    feeBalance:
                        student.feeBalance

                }

            });

        } catch (error) {

            console.error(
                "❌ Create student error:",
                error
            );

            if (error.code === 11000) {

                return res.status(409).json({
                    success: false,
                    message:
                        "This email is already registered."
                });

            }

            return res.status(500).json({

                success: false,

                message:
                    "Could not create student information.",

                error:
                    error.message

            });

        }

    }
);


/* =====================================================
   STUDENT INFORMATION
   UPDATE
===================================================== */

app.put(
    "/api/student-information/:id",
    async (req, res) => {

        try {

            if (
                !mongoose.Types.ObjectId
                    .isValid(req.params.id)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid student ID."
                });

            }

            const {
                name,
                email,
                phone,
                course,
                attendance,
                gpa,
                feeBalance
            } = req.body;

            const student =
                await Student.findById(
                    req.params.id
                );

            if (!student) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found."
                });

            }

            if (name !== undefined) {

                student.name =
                    String(name).trim();

            }

            if (email !== undefined) {

                student.email =
                    String(email)
                        .trim()
                        .toLowerCase();

            }

            if (phone !== undefined) {

                student.phone =
                    String(phone).trim();

            }

            if (course !== undefined) {

                student.course =
                    String(course).trim();

            }

            if (attendance !== undefined) {

                student.attendance =
                    Number(attendance) || 0;

            }

            if (gpa !== undefined) {

                student.gpa =
                    Number(gpa) || 0;

            }

            if (feeBalance !== undefined) {

                student.feeBalance =
                    Number(feeBalance) || 0;

                student.amount =
                    Number(feeBalance) || 0;

            }

            await student.save();

            console.log(
                "✅ Student updated:",
                student.email
            );

            return res.json({

                success: true,

                message:
                    "Student information updated successfully.",

                student: {

                    _id:
                        student._id,

                    id:
                        student._id,

                    name:
                        student.name,

                    email:
                        student.email,

                    phone:
                        student.phone,

                    course:
                        student.course,

                    attendance:
                        student.attendance,

                    gpa:
                        student.gpa,

                    feeBalance:
                        student.feeBalance

                }

            });

        } catch (error) {

            console.error(
                "❌ Update student error:",
                error
            );

            if (error.code === 11000) {

                return res.status(409).json({
                    success: false,
                    message:
                        "This email is already registered."
                });

            }

            return res.status(500).json({

                success: false,

                message:
                    "Could not update student information.",

                error:
                    error.message

            });

        }

    }
);


/* =====================================================
   STUDENT INFORMATION
   DELETE
===================================================== */

app.delete(
    "/api/student-information/:id",
    async (req, res) => {

        try {

            if (
                !mongoose.Types.ObjectId
                    .isValid(req.params.id)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid student ID."
                });

            }

            const student =
                await Student.findByIdAndDelete(
                    req.params.id
                );

            if (!student) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found."
                });

            }

            console.log(
                "🗑️ Student deleted:",
                student.email
            );

            return res.json({

                success: true,

                message:
                    "Student information deleted successfully."

            });

        } catch (error) {

            console.error(
                "❌ Delete student error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Could not delete student information."

            });

        }

    }
);


/* =====================================================
   CREATE PAYMENT
===================================================== */

app.post(
    "/api/payment/create",
    async (req, res) => {

        try {

            const {
                name,
                email,
                phone,
                course,
                amount,
                paymentMethod
            } = req.body;

            if (
                !name ||
                !email ||
                !amount
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, email and amount are required."

                });

            }

            const transactionId =
                "NOVA-" +
                Date.now() +
                "-" +
                Math.floor(
                    Math.random() * 1000
                );

            const payment =
                new Payment({

                    transactionId,

                    name,

                    email,

                    phone,

                    course,

                    amount:
                        Number(amount),

                    paymentMethod,

                    paymentStatus:
                        "Pending"

                });

            await payment.save();

            await Student.findOneAndUpdate(

                {
                    email:
                        String(email)
                            .trim()
                            .toLowerCase()
                },

                {

                    paymentMethod:
                        paymentMethod || "",

                    amount:
                        Number(amount) || 0,

                    feeBalance:
                        Number(amount) || 0

                }

            );

            console.log(
                "✅ Payment saved:",
                transactionId
            );

            return res.json({

                success: true,

                message:
                    "Payment request saved successfully!",

                transactionId,

                paymentMethod,

                amount

            });

        } catch (error) {

            console.error(
                "❌ Payment error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to save payment.",

                error:
                    error.message

            });

        }

    }
);


/* =====================================================
   GET ALL STUDENTS
===================================================== */

app.get(
    "/api/students",
    async (req, res) => {

        try {

            const students =
                await Student.find()
                    .select("-password")
                    .sort({
                        createdAt: -1
                    });

            return res.json({

                success: true,

                count:
                    students.length,

                students

            });

        } catch (error) {

            console.error(
                "❌ Get all students error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Could not retrieve students."

            });

        }

    }
);


/* =====================================================
   GET ALL PAYMENTS
===================================================== */

app.get(
    "/api/payments",
    async (req, res) => {

        try {

            const payments =
                await Payment.find()
                    .sort({
                        createdAt: -1
                    });

            return res.json({

                success: true,

                count:
                    payments.length,

                payments

            });

        } catch (error) {

            console.error(
                "❌ Get payments error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Could not retrieve payments."

            });

        }

    }
);


/* =====================================================
   NOVA COLLEGE - ADMIN API
   IMPORTANT:
   THESE ROUTES MUST COME BEFORE THE API 404 ROUTE
===================================================== */

const ADMIN_KEY =
    process.env.ADMIN_KEY || "NovaAdmin2026";


/* =====================================================
   ADMIN AUTHENTICATION
===================================================== */

function checkAdmin(req, res, next) {

    const key =
        req.headers["x-admin-key"];

    if (!key || key !== ADMIN_KEY) {

        return res.status(401).json({

            success: false,

            message:
                "Unauthorized. Admin access required."

        });

    }

    next();
}


/* =====================================================
   ADMIN - GET ALL STUDENTS
===================================================== */

app.get(
    "/api/admin/students",
    checkAdmin,
    async (req, res) => {

        try {

            const students =
                await Student
                    .find({})
                    .select("-password")
                    .sort({
                        createdAt: -1
                    });

            return res.json({

                success: true,

                count:
                    students.length,

                students

            });

        } catch (error) {

            console.error(
                "Admin students error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Could not load students."

            });

        }

    }
);


/* =====================================================
   ADMIN - DASHBOARD STATISTICS
===================================================== */

app.get(
    "/api/admin/stats",
    checkAdmin,
    async (req, res) => {

        try {

            const totalStudents =
                await Student.countDocuments();

            const totalFees =
                await Student.aggregate([

                    {
                        $group: {

                            _id: null,

                            total: {
                                $sum: "$feeBalance"
                            }

                        }

                    }

                ]);

            const averageGPA =
                await Student.aggregate([

                    {
                        $group: {

                            _id: null,

                            average: {
                                $avg: "$gpa"
                            }

                        }

                    }

                ]);

            const averageAttendance =
                await Student.aggregate([

                    {
                        $group: {

                            _id: null,

                            average: {
                                $avg: "$attendance"
                            }

                        }

                    }

                ]);

            return res.json({

                success: true,

                stats: {

                    totalStudents,

                    totalFees:
                        Number(
                            totalFees[0]?.total || 0
                        ),

                    averageGPA:
                        Number(
                            averageGPA[0]?.average || 0
                        ).toFixed(2),

                    averageAttendance:
                        Number(
                            averageAttendance[0]?.average || 0
                        ).toFixed(2)

                }

            });

        } catch (error) {

            console.error(
                "Admin stats error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Could not load statistics."

            });

        }

    }
);


/* =====================================================
   ADMIN - UPDATE STUDENT
===================================================== */

app.put(
    "/api/admin/students/:id",
    checkAdmin,
    async (req, res) => {

        try {

            const studentId =
                req.params.id;

            if (
                !mongoose.Types.ObjectId
                    .isValid(studentId)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid student ID."

                });

            }

            const {
                name,
                email,
                phone,
                course,
                attendance,
                gpa,
                feeBalance
            } = req.body;

            const student =
                await Student.findById(
                    studentId
                );

            if (!student) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student not found."

                });

            }

            if (name !== undefined) {

                student.name =
                    String(name).trim();

            }

            if (email !== undefined) {

                student.email =
                    String(email)
                        .trim()
                        .toLowerCase();

            }

            if (phone !== undefined) {

                student.phone =
                    String(phone).trim();

            }

            if (course !== undefined) {

                student.course =
                    String(course).trim();

            }

            if (attendance !== undefined) {

                const value =
                    Number(attendance);

                if (
                    Number.isNaN(value) ||
                    value < 0 ||
                    value > 100
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Attendance must be between 0 and 100."

                    });

                }

                student.attendance =
                    value;

            }

            if (gpa !== undefined) {

                const value =
                    Number(gpa);

                if (
                    Number.isNaN(value) ||
                    value < 0 ||
                    value > 4
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "GPA must be between 0 and 4."

                    });

                }

                student.gpa =
                    value;

            }

            if (feeBalance !== undefined) {

                const value =
                    Number(feeBalance);

                if (
                    Number.isNaN(value) ||
                    value < 0
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Fee balance cannot be negative."

                    });

                }

                student.feeBalance =
                    value;

            }

            await student.save();

            return res.json({

                success: true,

                message:
                    "Student updated successfully.",

                student: {

                    _id:
                        student._id,

                    name:
                        student.name,

                    email:
                        student.email,

                    phone:
                        student.phone,

                    course:
                        student.course,

                    attendance:
                        student.attendance,

                    gpa:
                        student.gpa,

                    feeBalance:
                        student.feeBalance

                }

            });

        } catch (error) {

            console.error(
                "Admin update error:",
                error
            );

            if (
                error.code === 11000
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Another student already uses this email."

                });

            }

            return res.status(500).json({

                success: false,

                message:
                    "Could not update student."

            });

        }

    }
);


/* =====================================================
   ADMIN - DELETE STUDENT
===================================================== */

app.delete(
    "/api/admin/students/:id",
    checkAdmin,
    async (req, res) => {

        try {

            const studentId =
                req.params.id;

            if (
                !mongoose.Types.ObjectId
                    .isValid(studentId)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid student ID."

                });

            }

            const deletedStudent =
                await Student.findByIdAndDelete(
                    studentId
                );

            if (!deletedStudent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student not found."

                });

            }

            return res.json({

                success: true,

                message:
                    "Student deleted successfully."

            });

        } catch (error) {

            console.error(
                "Admin delete error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Could not delete student."

            });

        }

    }
);


/* =====================================================
   API 404
   THIS MUST BE AFTER ALL API ROUTES
===================================================== */
app.use((req, res) => {
    console.log(
        "UNMATCHED REQUEST:",
        req.method,
        req.originalUrl
    );

    if (req.originalUrl.startsWith("/api/")) {
        return res.status(404).json({
            success: false,
            message: "API route not found.",
            method: req.method,
            path: req.originalUrl
        });
    }

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

/* =====================================================
   START SERVER
===================================================== */

async function startServer() {

    try {

        console.log(
            "Connecting to MongoDB..."
        );

        await mongoose.connect(
            MONGO_URI
        );

        console.log(
            "✅ MongoDB connected successfully"
        );

        console.log(
            "Database: nova_college"
        );

        app.listen(
            PORT,
            () => {

                console.log(
                    "===================================="
                );

                console.log(
                    `✅ Server running at http://localhost:${PORT}`
                );

                console.log(
                    `✅ Website: http://localhost:${PORT}/`
                );

                console.log(
                    `✅ Student Information: http://localhost:${PORT}/student-information.html`
                );

                console.log(
                    `✅ Admin API: http://localhost:${PORT}/api/admin/stats`
                );

                console.log(
                    "===================================="
                );

            }
        );

    } catch (error) {

        console.error(
            "❌ MongoDB connection failed!"
        );

        console.error(
            error.message
        );

        process.exit(1);

    }

}

startServer();