/* =========================================================
   NOVA COLLEGE
   MAIN WEBSITE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const welcomeScreen = document.getElementById("welcome-screen");
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");
    const backToTop = document.getElementById("backToTop");
    const currentYear = document.getElementById("currentYear");


    /* =====================================================
       WELCOME SCREEN
       ===================================================== */

    let welcomeClosed = false;

    function closeWelcomeScreen() {

        if (!welcomeScreen || welcomeClosed) {
            return;
        }

        welcomeClosed = true;

        welcomeScreen.classList.add("hide");

        document.body.classList.remove("welcome-active");

        document.body.style.overflow = "auto";

        setTimeout(function () {

            if (welcomeScreen) {
                welcomeScreen.style.display = "none";
                welcomeScreen.style.visibility = "hidden";
                welcomeScreen.style.pointerEvents = "none";
            }

        }, 1000);
    }


    if (welcomeScreen) {

        document.body.classList.add("welcome-active");

        setTimeout(function () {
            closeWelcomeScreen();
        }, 3000);

        setTimeout(function () {
            closeWelcomeScreen();
        }, 4500);

        welcomeScreen.addEventListener("click", function () {
            closeWelcomeScreen();
        });
    }


    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    if (menuToggle && navMenu) {

        menuToggle.addEventListener("click", function (event) {

            event.stopPropagation();

            const isOpen =
                navMenu.classList.toggle("active");

            menuToggle.classList.toggle(
                "active",
                isOpen
            );

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
            );
        });


        const navLinks =
            navMenu.querySelectorAll("a");

        navLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                navMenu.classList.remove("active");

                menuToggle.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );
            });
        });


        document.addEventListener("click", function (event) {

            if (
                navMenu.classList.contains("active") &&
                !navMenu.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {

                navMenu.classList.remove("active");

                menuToggle.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );
            }
        });
    }


    /* =====================================================
       SMOOTH SCROLL
       ===================================================== */

    const internalLinks =
        document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#" ||
                targetId.length <= 1
            ) {
                return;
            }

            let target = null;

            try {

                target =
                    document.querySelector(targetId);

            } catch (error) {

                return;
            }

            if (!target) {
                return;
            }

            event.preventDefault();

            const navbar =
                document.querySelector(".main-navbar");

            const offset =
                navbar ? navbar.offsetHeight : 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                offset;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

            try {

                history.pushState(
                    null,
                    "",
                    targetId
                );

            } catch (error) {
                // Ignore history errors
            }
        });
    });


    /* =====================================================
       BACK TO TOP
       ===================================================== */

    if (backToTop) {

        function updateBackToTop() {

            if (window.scrollY > 500) {

                backToTop.classList.add("show");

            } else {

                backToTop.classList.remove("show");
            }
        }

        window.addEventListener(
            "scroll",
            updateBackToTop,
            { passive: true }
        );

        updateBackToTop();

        backToTop.addEventListener(
            "click",
            function () {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );
    }


    /* =====================================================
       CURRENT YEAR
       ===================================================== */

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();
    }


    /* =====================================================
       ACTIVE NAVIGATION
       ===================================================== */

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );

    const mainNavLinks =
        document.querySelectorAll(
            '.nav-menu a[href^="#"]'
        );


    function updateActiveNavigation() {

        let currentSection = "";

        const scrollPosition =
            window.scrollY + 180;


        sections.forEach(function (section) {

            const sectionTop =
                section.offsetTop;

            const sectionHeight =
                section.offsetHeight;


            if (
                scrollPosition >= sectionTop &&
                scrollPosition <
                    sectionTop + sectionHeight
            ) {

                currentSection =
                    section.getAttribute("id");
            }
        });


        mainNavLinks.forEach(function (link) {

            link.classList.remove("active");

            const href =
                link.getAttribute("href");


            if (
                currentSection &&
                href === "#" + currentSection
            ) {

                link.classList.add("active");
            }
        });
    }


    window.addEventListener(
        "scroll",
        updateActiveNavigation,
        { passive: true }
    );

    updateActiveNavigation();


    /* =====================================================
       RESIZE
       ===================================================== */

    window.addEventListener(
        "resize",
        function () {

            if (window.innerWidth > 900) {

                if (navMenu) {
                    navMenu.classList.remove("active");
                }

                if (menuToggle) {

                    menuToggle.classList.remove("active");

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    menuToggle.setAttribute(
                        "aria-label",
                        "Open navigation menu"
                    );
                }
            }
        }
    );


    /* =====================================================
       IMAGE ERROR HANDLING
       ===================================================== */

    const images =
        document.querySelectorAll("img");


    images.forEach(function (image) {

        image.addEventListener(
            "error",
            function () {

                console.warn(
                    "Nova College image could not be loaded:",
                    image.getAttribute("src")
                );

                image.classList.add(
                    "image-error"
                );
            }
        );
    });


    /* =====================================================
       HTML PAGE LINKS
       ===================================================== */

    const pageLinks =
        document.querySelectorAll(
            'a[href$=".html"]'
        );


    pageLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                if (navMenu) {
                    navMenu.classList.remove("active");
                }

                if (menuToggle) {

                    menuToggle.classList.remove(
                        "active"
                    );

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    menuToggle.setAttribute(
                        "aria-label",
                        "Open navigation menu"
                    );
                }
            }
        );
    });


    /* =====================================================
       BUTTON CLICK EFFECT
       ===================================================== */

    const buttons =
        document.querySelectorAll(
            ".gold-btn, .white-btn, .program-link, .text-link"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                button.classList.add("clicked");

                setTimeout(function () {

                    button.classList.remove(
                        "clicked"
                    );

                }, 800);
            }
        );
    });


    /* =====================================================
       STUDENT ADMISSION / REGISTRATION
       ===================================================== */

    const admissionForm =
        document.getElementById("admissionForm");

    if (admissionForm) {

        admissionForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const submitButton =
                    document.getElementById("submitButton");

                const message =
                    document.getElementById("message");


                /* -----------------------------------------
                   GET FORM VALUES
                   ----------------------------------------- */

                const nameElement =
                    document.getElementById("name");

                const emailElement =
                    document.getElementById("email");

                const passwordElement =
                    document.getElementById("password");

                const phoneElement =
                    document.getElementById("phone");

                const courseElement =
                    document.getElementById("course");


                const name =
                    nameElement
                        ? nameElement.value.trim()
                        : "";

                const email =
                    emailElement
                        ? emailElement.value.trim()
                        : "";

                const password =
                    passwordElement
                        ? passwordElement.value
                        : "";

                const phone =
                    phoneElement
                        ? phoneElement.value.trim()
                        : "";

                const course =
                    courseElement
                        ? courseElement.value
                        : "";


                /* -----------------------------------------
                   PAYMENT METHOD
                   ----------------------------------------- */

                /*
                   Current Nova College backend uses
                   BANK payment only.
                */

                const paymentMethod = "bank";


                /* -----------------------------------------
                   VALIDATION
                   ----------------------------------------- */

                if (!name || !email || !password) {

                    showAdmissionMessage(
                        "Please fill in your name, email and password.",
                        "error"
                    );

                    return;
                }


                if (password.length < 6) {

                    showAdmissionMessage(
                        "Password must be at least 6 characters.",
                        "error"
                    );

                    return;
                }


                if (!course) {

                    showAdmissionMessage(
                        "Please select your course.",
                        "error"
                    );

                    return;
                }


                /* -----------------------------------------
                   BUTTON
                   ----------------------------------------- */

                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.dataset.originalText =
                        submitButton.textContent;

                    submitButton.textContent =
                        "Submitting...";
                }


                showAdmissionMessage(
                    "Submitting your admission application...",
                    "loading"
                );


                try {

                    /* -------------------------------------
                       REGISTER STUDENT
                       ------------------------------------- */

                    const registerResponse =
                        await fetch(
                            "/api/register",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    name: name,

                                    email: email,

                                    password: password,

                                    phone: phone,

                                    course: course

                                })
                            }
                        );


                    let registerData;

                    try {

                        registerData =
                            await registerResponse.json();

                    } catch (jsonError) {

                        throw new Error(
                            "Server returned an invalid response."
                        );
                    }


                    if (
                        !registerResponse.ok ||
                        !registerData.success
                    ) {

                        throw new Error(
                            registerData.message ||
                            "Registration failed."
                        );
                    }


                    /* -------------------------------------
                       SAVE STUDENT LOCALLY
                       ------------------------------------- */

                    if (registerData.student) {

                        localStorage.setItem(
                            "novaStudent",
                            JSON.stringify(
                                registerData.student
                            )
                        );

                        localStorage.setItem(
                            "student",
                            JSON.stringify(
                                registerData.student
                            )
                        );
                    }


                    /* -------------------------------------
                       CREATE PAYMENT RECORD
                       ------------------------------------- */

                    let paymentData = null;

                    try {

                        const paymentResponse =
                            await fetch(
                                "/api/payment/create",
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body: JSON.stringify({

                                        name: name,

                                        email: email,

                                        phone: phone,

                                        course: course,

                                        studentId:
                                            registerData.student &&
                                            registerData.student.studentId
                                                ? registerData.student.studentId
                                                : "",

                                        amount: 5000,

                                        paymentMethod:
                                            paymentMethod

                                    })
                                }
                            );


                        try {

                            paymentData =
                                await paymentResponse.json();

                        } catch (error) {

                            paymentData = null;
                        }


                        if (
                            !paymentResponse.ok ||
                            !paymentData ||
                            !paymentData.success
                        ) {

                            console.warn(
                                "Payment API returned an error:",
                                paymentData
                            );

                            paymentData = {

                                success: false,

                                message:
                                    paymentData &&
                                    paymentData.message
                                        ? paymentData.message
                                        : "Payment record could not be created."
                            };
                        }

                    } catch (paymentError) {

                        console.warn(
                            "Payment request could not be completed:",
                            paymentError
                        );

                        paymentData = {

                            success: false,

                            message:
                                "Payment record could not be created because the server could not be reached."
                        };
                    }


                    /* -------------------------------------
                       SUCCESS
                       ------------------------------------- */

                    let successText =
                        "Admission submitted successfully!";


                    if (
                        paymentData &&
                        paymentData.success
                    ) {

                        successText +=
                            " Payment record created.";

                    } else {

                        successText +=
                            " Your application was saved, but the payment record could not be created. Please contact Nova College administration.";
                    }


                    showAdmissionMessage(
                        successText,
                        "success"
                    );


                    /* -------------------------------------
                       REDIRECT TO LOGIN
                       ------------------------------------- */

                    setTimeout(function () {

                        window.location.href =
                            "/loginform.html";

                    }, 1500);

                } catch (error) {

                    console.error(
                        "❌ Admission submission error:",
                        error
                    );


                    let errorMessage =
                        error.message ||
                        "Could not submit admission.";


                    if (
                        error.message &&
                        error.message.includes(
                            "Failed to fetch"
                        )
                    ) {

                        errorMessage =
                            "Cannot connect to server. Make sure Node.js and MongoDB are running.";
                    }


                    showAdmissionMessage(
                        errorMessage,
                        "error"
                    );

                } finally {

                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.textContent =
                            submitButton.dataset.originalText ||
                            "Submit Application & Pay";
                    }
                }
            }
        );
    }


    /* =====================================================
       ADMISSION MESSAGE HELPER
       ===================================================== */

    function showAdmissionMessage(
        text,
        type
    ) {

        const message =
            document.getElementById("message");

        if (!message) {
            return;
        }

        message.textContent = text;

        message.style.display = "block";

        message.classList.remove(
            "success",
            "error",
            "loading"
        );

        if (type) {
            message.classList.add(type);
        }
    }


    /* =====================================================
       KEYBOARD
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                if (navMenu) {

                    navMenu.classList.remove(
                        "active"
                    );
                }

                if (menuToggle) {

                    menuToggle.classList.remove(
                        "active"
                    );

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    menuToggle.setAttribute(
                        "aria-label",
                        "Open navigation menu"
                    );
                }

                closeWelcomeScreen();
            }
        }
    );


    /* =====================================================
       PAGE VISIBILITY
       ===================================================== */

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.visibilityState ===
                "visible"
            ) {

                if (
                    welcomeScreen &&
                    !welcomeClosed
                ) {

                    setTimeout(
                        closeWelcomeScreen,
                        200
                    );
                }
            }
        }
    );


    /* =====================================================
       FINAL STATUS
       ===================================================== */

    console.log(
        "✅ Nova College JavaScript loaded successfully."
    );

});