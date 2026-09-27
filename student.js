document.addEventListener("DOMContentLoaded", async () => {

    const API_BASE = window.location.origin;

    const studentName = document.getElementById("studentName");
    const studentId = document.getElementById("studentId");

    const infoName = document.getElementById("infoName");
    const infoEmail = document.getElementById("infoEmail");
    const infoPhone = document.getElementById("infoPhone");
    const infoCourse = document.getElementById("infoCourse");
    const infoClass = document.getElementById("infoClass");
    const infoSection = document.getElementById("infoSection");
    const infoRoll = document.getElementById("infoRoll");
    const infoStatus = document.getElementById("infoStatus");

    const attendance = document.getElementById("attendance");
    const feeBalance = document.getElementById("feeBalance");
    const subjects = document.getElementById("subjects");
    const remarks = document.getElementById("remarks");

    const marksContainer =
        document.getElementById("marksContainer");

    const message =
        document.getElementById("message");

    const logoutBtn =
        document.getElementById("logoutBtn");


    // ========================================================
    // HELPERS
    // ========================================================

    function showMessage(text, type = "error") {

        if (!message) return;

        message.textContent = text;

        message.className =
            `message show ${type}`;
    }


    function valueOrDefault(value, fallback = "Not assigned") {

        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ""
        ) {
            return fallback;
        }

        return value;
    }


    // ========================================================
    // GET STUDENT DATA FROM LOCAL STORAGE
    // ========================================================

    let student = null;

    const storageKeys = [
        "student",
        "studentData",
        "loggedInStudent",
        "currentStudent"
    ];

    for (const key of storageKeys) {

        try {

            const raw =
                localStorage.getItem(key);

            if (!raw) continue;

            const parsed =
                JSON.parse(raw);

            if (parsed) {

                student =
                    parsed.student ||
                    parsed;

                break;
            }

        } catch (error) {

            console.log(
                `Unable to read ${key}`
            );

        }
    }


    // ========================================================
    // IF NO LOGIN DATA
    // ========================================================

    if (!student) {

        showMessage(
            "Student login information was not found. Please login again.",
            "error"
        );

        setTimeout(() => {

            window.location.href =
                "loginform.html";

        }, 1800);

        return;
    }


    console.log(
        "Student data:",
        student
    );


    // ========================================================
    // FIND IDENTIFIER
    // ========================================================

    const email =
        student.email ||
        student.studentEmail;

    const mongoId =
        student.id ||
        student._id;

    const savedStudentId =
        student.studentId;


    console.log(
        "Email:",
        email
    );

    console.log(
        "Mongo ID:",
        mongoId
    );

    console.log(
        "Student ID:",
        savedStudentId
    );


    // ========================================================
    // DISPLAY SAVED INFORMATION FIRST
    // ========================================================

    if (studentName) {

        studentName.textContent =
            valueOrDefault(
                student.name,
                "Student"
            );

    }


    if (studentId) {

        studentId.textContent =
            valueOrDefault(
                savedStudentId,
                "Loading..."
            );

    }


    if (infoName) {

        infoName.textContent =
            valueOrDefault(
                student.name
            );

    }


    if (infoEmail) {

        infoEmail.textContent =
            valueOrDefault(
                email
            );

    }


    if (infoPhone) {

        infoPhone.textContent =
            valueOrDefault(
                student.phone
            );

    }


    if (infoCourse) {

        infoCourse.textContent =
            valueOrDefault(
                student.course
            );

    }


    // ========================================================
    // LOAD FROM SERVER
    // ========================================================

    async function requestStudent(identifier) {

        if (!identifier) {
            return null;
        }

        try {

            const url =
                `${API_BASE}/api/student-information/${encodeURIComponent(identifier)}`;

            console.log(
                "Requesting:",
                url
            );

            const response =
                await fetch(url);

            const data =
                await response.json();

            console.log(
                "Server response:",
                data
            );

            if (
                response.ok &&
                data.success
            ) {

                return data;
            }

        } catch (error) {

            console.error(
                "Request error:",
                error
            );

        }

        return null;
    }


    // ========================================================
    // TRY EMAIL FIRST
    // THEN STUDENT ID
    // THEN MONGODB ID
    // ========================================================

    let data = null;

    if (email) {

        data =
            await requestStudent(email);

    }


    if (!data && savedStudentId) {

        data =
            await requestStudent(
                savedStudentId
            );

    }


    if (!data && mongoId) {

        data =
            await requestStudent(
                mongoId
            );

    }


    // ========================================================
    // STILL NOT FOUND
    // ========================================================

    if (!data) {

        showMessage(
            `Student record was not found on the server.

Email: ${email || "missing"}
Student ID: ${savedStudentId || "missing"}

Please login again.`,
            "error"
        );

        console.error(
            "Could not find student using:",
            {
                email,
                savedStudentId,
                mongoId
            }
        );

        return;
    }


    // ========================================================
    // GET SERVER DATA
    // ========================================================

    const serverStudent =
        data.student ||
        student;

    const information =
        data.information ||
        data.studentInformation ||
        {};


    // ========================================================
    // STUDENT ID
    // ========================================================

    const finalStudentId =
        serverStudent.studentId ||
        information.studentId ||
        savedStudentId;


    if (studentId) {

        studentId.textContent =
            valueOrDefault(
                finalStudentId,
                "Not assigned"
            );

    }


    // ========================================================
    // BASIC INFORMATION
    // ========================================================

    if (studentName) {

        studentName.textContent =
            valueOrDefault(
                serverStudent.name,
                "Student"
            );

    }


    if (infoName) {

        infoName.textContent =
            valueOrDefault(
                serverStudent.name ||
                information.name
            );

    }


    if (infoEmail) {

        infoEmail.textContent =
            valueOrDefault(
                serverStudent.email ||
                information.email
            );

    }


    if (infoPhone) {

        infoPhone.textContent =
            valueOrDefault(
                serverStudent.phone ||
                information.phone
            );

    }


    if (infoCourse) {

        infoCourse.textContent =
            valueOrDefault(
                serverStudent.course ||
                information.course
            );

    }


    // ========================================================
    // CLASS
    // ========================================================

    if (infoClass) {

        infoClass.textContent =
            valueOrDefault(
                information.className
            );

    }


    // ========================================================
    // SECTION
    // ========================================================

    if (infoSection) {

        infoSection.textContent =
            valueOrDefault(
                information.section
            );

    }


    // ========================================================
    // ROLL NUMBER
    // ========================================================

    if (infoRoll) {

        infoRoll.textContent =
            valueOrDefault(
                information.rollNumber
            );

    }


    // ========================================================
    // STATUS
    // ========================================================

    if (infoStatus) {

        infoStatus.textContent =
            valueOrDefault(
                serverStudent.admissionStatus ||
                serverStudent.status
            );

    }


    // ========================================================
    // ATTENDANCE
    // ========================================================

    if (attendance) {

        attendance.textContent =
            valueOrDefault(
                information.attendance
            );

    }


    // ========================================================
    // FEE
    // ========================================================

    if (feeBalance) {

        const fee =
            Number(
                information.feeBalance
            );

        if (
            information.feeBalance !==
                undefined &&
            information.feeBalance !==
                null &&
            !Number.isNaN(fee)
        ) {

            feeBalance.textContent =
                `Rs. ${fee.toLocaleString()}`;

        } else {

            feeBalance.textContent =
                "Rs. 0";

        }

    }


    // ========================================================
    // SUBJECTS
    // ========================================================

    if (subjects) {

        const subjectData =
            information.subjects;

        if (Array.isArray(subjectData)) {

            subjects.textContent =
                subjectData.length
                    ? `${subjectData.length} Subjects`
                    : "Not assigned";

        } else if (
            subjectData &&
            typeof subjectData === "object"
        ) {

            const count =
                Object.keys(
                    subjectData
                ).length;

            subjects.textContent =
                count
                    ? `${count} Subjects`
                    : "Not assigned";

        } else {

            subjects.textContent =
                valueOrDefault(
                    subjectData
                );

        }

    }


    // ========================================================
    // REMARKS
    // ========================================================

    if (remarks) {

        remarks.textContent =
            valueOrDefault(
                information.remarks,
                "No remarks"
            );

    }


    // ========================================================
    // MARKS
    // ========================================================

    renderMarks(
        information.marks
    );


    // ========================================================
    // SAVE UPDATED STUDENT DATA
    // ========================================================

    const updatedStudent = {
        ...student,
        ...serverStudent,

        studentId:
            finalStudentId,

        email:
            serverStudent.email ||
            information.email ||
            email
    };


    localStorage.setItem(
        "student",
        JSON.stringify(
            updatedStudent
        )
    );


    // ========================================================
    // SUCCESS
    // ========================================================

    showMessage(
        "Student information loaded successfully.",
        "success"
    );


    // ========================================================
    // RENDER MARKS
    // ========================================================

    function renderMarks(marks) {

        if (!marksContainer) {
            return;
        }

        if (!marks) {

            marksContainer.innerHTML = `
                <div class="empty-state">
                    Marks have not been added yet.
                </div>
            `;

            return;
        }


        // Array
        if (Array.isArray(marks)) {

            if (!marks.length) {

                marksContainer.innerHTML = `
                    <div class="empty-state">
                        Marks have not been added yet.
                    </div>
                `;

                return;
            }

            let rows = "";

            marks.forEach(
                (item, index) => {

                    if (
                        typeof item ===
                        "object"
                    ) {

                        rows += `
                            <tr>
                                <td>
                                    ${valueOrDefault(
                                        item.subject ||
                                        item.name,
                                        `Subject ${index + 1}`
                                    )}
                                </td>

                                <td>
                                    ${valueOrDefault(
                                        item.marks ||
                                        item.obtained ||
                                        item.score,
                                        "-"
                                    )}
                                </td>

                                <td>
                                    ${valueOrDefault(
                                        item.total ||
                                        item.totalMarks,
                                        "-"
                                    )}
                                </td>

                                <td>
                                    ${valueOrDefault(
                                        item.grade,
                                        "-"
                                    )}
                                </td>
                            </tr>
                        `;

                    } else {

                        rows += `
                            <tr>
                                <td>
                                    Subject ${index + 1}
                                </td>

                                <td colspan="3">
                                    ${valueOrDefault(
                                        item,
                                        "-"
                                    )}
                                </td>
                            </tr>
                        `;

                    }

                }
            );


            marksContainer.innerHTML = `
                <table class="marks-table">

                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Obtained</th>
                            <th>Total</th>
                            <th>Grade</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>
            `;

            return;
        }


        // Object
        if (
            typeof marks === "object"
        ) {

            const entries =
                Object.entries(marks);

            if (!entries.length) {

                marksContainer.innerHTML = `
                    <div class="empty-state">
                        Marks have not been added yet.
                    </div>
                `;

                return;
            }


            let rows = "";

            entries.forEach(
                ([subject, value]) => {

                    let obtained = value;
                    let total = "-";
                    let grade = "-";

                    if (
                        typeof value ===
                        "object" &&
                        value !== null
                    ) {

                        obtained =
                            value.marks ??
                            value.obtained ??
                            value.score ??
                            "-";

                        total =
                            value.total ??
                            value.totalMarks ??
                            "-";

                        grade =
                            value.grade ??
                            "-";

                    }

                    rows += `
                        <tr>
                            <td>${subject}</td>
                            <td>${obtained}</td>
                            <td>${total}</td>
                            <td>${grade}</td>
                        </tr>
                    `;

                }
            );


            marksContainer.innerHTML = `
                <table class="marks-table">

                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Obtained</th>
                            <th>Total</th>
                            <th>Grade</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>
            `;

        }

    }


    // ========================================================
    // LOGOUT
    // ========================================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "student"
                );

                localStorage.removeItem(
                    "studentData"
                );

                localStorage.removeItem(
                    "loggedInStudent"
                );

                localStorage.removeItem(
                    "currentStudent"
                );

                localStorage.removeItem(
                    "studentId"
                );

                window.location.href =
                    "loginform.html";
            }
        );

    }

});
