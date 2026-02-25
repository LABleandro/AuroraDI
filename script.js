 document.addEventListener('DOMContentLoaded', () => {
            // --- DOM Elements ---
            const modal = document.getElementById('bookingModal');
            const form = document.getElementById('bookingForm');
            const submitBtn = document.getElementById('submitBtn');
            const fileInput = document.getElementById('fileUpload');
            const fileListDisplay = document.getElementById('fileListDisplay');
            const formFeedback = document.getElementById('formFeedback');
            const mapLink = document.getElementById('dynamicMapLink');

            // Inputs required for validation
            const requiredInputs = {
                firstName: document.getElementById('firstName'),
                lastName: document.getElementById('lastName'),
                email: document.getElementById('email'),
                phone: document.getElementById('phone')
            };
            
            // Error display elements
            const errors = {
                firstName: document.getElementById('firstNameError'),
                lastName: document.getElementById('lastNameError'),
                phone: document.getElementById('phoneError'),
                email: document.getElementById('emailError'),
                file: document.getElementById('fileError')
            };

            // Constants related to validation
            const MAX_FILES = 4;
            const MAX_TOTAL_SIZE_MB = 10;
            const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;
            // Regex for basic phone validation (allows digits, spaces, dashes, parens, plus)
            const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            // Simple email validation (basic but effective for most cases)
            const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // State tracking
            let isFileValid = true;

            // --- MODAL FUNCTIONS ---
            // --- MOBILE NAV ---
            const hamburgerBtn = document.getElementById('hamburgerBtn');
            const navMenu = document.querySelector('.nav-menu');

            if (hamburgerBtn && navMenu) {
                const headerContainer = document.querySelector('.header-container');
                hamburgerBtn.addEventListener('click', (e) => {
                    const isOpen = navMenu.classList.toggle('mobile');
                    hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                    // Add a class to header so we can hide the contact bar via CSS when nav is open
                    if (headerContainer) headerContainer.classList.toggle('nav-open', isOpen);
                });

                // Close menu when clicking a link
                navMenu.querySelectorAll('a').forEach(a => {
                    a.addEventListener('click', () => {
                        if (navMenu.classList.contains('mobile')) {
                            navMenu.classList.remove('mobile');
                            hamburgerBtn.setAttribute('aria-expanded', 'false');
                        }
                    });
                });

                // Close on outside click
                document.addEventListener('click', (e) => {
                    if (!navMenu.classList.contains('mobile')) return;
                    const target = e.target;
                    if (!navMenu.contains(target) && !hamburgerBtn.contains(target)) {
                        navMenu.classList.remove('mobile');
                        hamburgerBtn.setAttribute('aria-expanded', 'false');
                    }
                });
            }
            window.openModal = function() {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
                checkFormValidity(); // Initial check
            }

            window.closeModal = function() {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
                resetFormUI();
            }

            // Close modal if clicking outside container
            modal.addEventListener('click', (e) => {
                //if (e.target === modal) window.closeModal();
            });


            // --- VALIDATION LOGIC ---

            function resetFormUI() {
                form.reset();
                Object.values(errors).forEach(err => err.style.display = 'none');
                Object.values(requiredInputs).forEach(input => input.classList.remove('invalid'));
                fileListDisplay.innerHTML = '';
                formFeedback.innerHTML = '';
                submitBtn.classList.remove('active');
                isFileValid = true;
            }

            function showError(type, show) {
                errors[type].style.display = show ? 'block' : 'none';
                if (requiredInputs[type]) {
                    requiredInputs[type].classList.toggle('invalid', show);
                }
            }

            // Validate Text Inputs on Blur (when user leaves the field)
            requiredInputs.firstName.addEventListener('blur', () => {
                showError('firstName', !requiredInputs.firstName.value.trim());
                checkFormValidity();
            });

            requiredInputs.lastName.addEventListener('blur', () => {
                showError('lastName', !requiredInputs.lastName.value.trim());
                checkFormValidity();
            });

            requiredInputs.phone.addEventListener('blur', () => {
                const val = requiredInputs.phone.value.trim();
                
                const isValidPhone = val !== '' && PHONE_REGEX.test(val);
                showError('phone', !isValidPhone);
                checkFormValidity();
            });

            requiredInputs.email.addEventListener('blur', () => {
                const val = requiredInputs.email.value.trim();
                const isValidEmail = val !== '' && EMAIL_REGEX.test(val);
                showError('email', !isValidEmail);
                checkFormValidity();
            });
            
            // Also check on input for smoother UX once errors are shown
            Object.values(requiredInputs).forEach(input => {
                input.addEventListener('input', checkFormValidity);
            });


            // File Validation
            fileInput.addEventListener('change', validateFiles);

            function validateFiles() {
                const files = Array.from(fileInput.files);
                let totalSize = 0;
                let fileNamesHtml = [];
                isFileValid = true;
                let errorMessage = "";

                // Reset file UI
                showError('file', false);
                fileListDisplay.innerHTML = '';

                if (files.length === 0) {
                    checkFormValidity();
                    return;
                }

                // Check 1: Max file count
                if (files.length > MAX_FILES) {
                    errorMessage = `Maximum of ${MAX_FILES} files allowed.`;
                    isFileValid = false;
                } else {
                    // Check 2: Total Size and create list
                    for (let file of files) {
                        totalSize += file.size;
                        fileNamesHtml.push(`<div><i class="fas fa-file-alt" style="margin-right:5px; color:var(--gold-warm)"></i> ${file.name} (${(file.size/1024/1024).toFixed(1)}MB)</div>`);
                    }

                    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
                         errorMessage = `Total file size exceeds ${MAX_TOTAL_SIZE_MB}MB limit. Current total: ${(totalSize/1024/1024).toFixed(1)}MB.`;
                         isFileValid = false;
                    }
                }

                if (!isFileValid) {
                    errors.file.textContent = errorMessage;
                    showError('file', true);
                    // Clear the input because it's invalid
                    fileInput.value = ''; 
                } else {
                    // Show selected files if valid
                    fileListDisplay.innerHTML = fileNamesHtml.join('');
                }
                checkFormValidity();
            }

            // Master check function to enable/disable submit button
            function checkFormValidity() {
                const fNameValid = requiredInputs.firstName.value.trim() !== '';
                const lNameValid = requiredInputs.lastName.value.trim() !== '';
                const emailValid = EMAIL_REGEX.test(requiredInputs.email.value.trim());
                const phoneValid = PHONE_REGEX.test(requiredInputs.phone.value.trim());

                // Form is valid if all required text fields pass and file input is valid
                const isFormValid = fNameValid && lNameValid && emailValid && phoneValid && isFileValid;

                if (isFormValid) {
                    submitBtn.classList.add('active');
                } else {
                    submitBtn.classList.remove('active');
                }
                return isFormValid;
            }


            // --- EMAILJS SUBMISSION HANDLER ---
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Final validation check before sending
                if (!checkFormValidity()) return;
                
                // Check if EmailJS is properly initialized
                if (!window.emailjs) {
                    alert("Developer Note: EmailJS library not loaded. Please ensure the CDN script is properly included.");
                    return;
                }

                // UI feedback - Disable button while sending
                submitBtn.classList.remove('active');
                submitBtn.innerText = "Sending...";
                formFeedback.innerHTML = '';

                try {
                    // Prepare template parameters
                    const templateParams = {
                        from_name: `${requiredInputs.firstName.value} ${requiredInputs.lastName.value}`,
                        from_email: requiredInputs.email.value,
                        phone_number: requiredInputs.phone.value,
                        first_name: requiredInputs.firstName.value,
                        last_name: requiredInputs.lastName.value,
                        message: "Appointment request submitted through the Aurora Diagnostic website.",
                        to_email: "YOUR_CLINIC_EMAIL_HERE" // Replace with actual clinic email
                    };

                    // Send email via EmailJS
                    // Replace 'YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID' with actual IDs
                    const response = await emailjs.send(
                        "YOUR_SERVICE_ID_HERE",
                        "YOUR_TEMPLATE_ID_HERE",
                        templateParams
                    );

                    // Handle file attachments separately if needed (EmailJS requires specific setup for attachments)
                    if (fileInput.files.length > 0) {
                        console.log("Note: File attachments require additional EmailJS configuration. Files selected:", fileInput.files.length);
                    }

                    if (response.status === 200) {
                        formFeedback.innerHTML = '<span class="feedback-success"><i class="fas fa-check-circle"></i> Request sent successfully! We will contact you soon.</span>';
                        // Auto close after 2 seconds on success
                        setTimeout(window.closeModal, 2000);
                    } else {
                        throw new Error("Unexpected response from server.");
                    }
                } catch (error) {
                    formFeedback.innerHTML = `<span class="feedback-error"><i class="fas fa-exclamation-circle"></i> ${error.message || 'Failed to send request. Please try again.'}</span>`;
                } finally {
                    // Reset button state
                    submitBtn.innerText = "Submit Request";
                    checkFormValidity(); // Re-enable if still valid
                }
            });


            // --- FAQ ACCORDION LOGIC ---
            const faqQuestions = document.querySelectorAll('.faq-question');
            faqQuestions.forEach(question => {
                question.addEventListener('click', () => {
                    question.classList.toggle('active');
                    const answer = question.nextElementSibling;
                    if (question.classList.contains('active')) {
                        answer.style.maxHeight = answer.scrollHeight + "px";
                    } else {
                        answer.style.maxHeight = 0;
                    }
                });
            });

            const serviceCards = document.querySelectorAll('.service-card');
            serviceCards.forEach(card => {
                card.addEventListener('click', () => {
                    card.classList.toggle('active');
                    //document.getElementById('troubleshoot').textContent = card.classList; // For troubleshooting - shows which card was clicked
                    const more = card.querySelector('.moreServices');
                    if (card.classList.contains('active')) {
                        more.style.maxHeight = more.scrollHeight + "px";
                    } else {
                        more.style.maxHeight = 0;
                        document.getElementById('troubleshoot').textContent = "";
                    }
                });
            });
            

            // --- SMART MAP LINK LOGIC (Footer) ---
            const addressQuery = encodeURIComponent("123 Aurora Blvd, Edmonton, AB");
            // Basic detection for iOS/Mac devices
            const isAppleDevice = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && !window.MSStream;

            if (isAppleDevice) {
                 // Open in Apple Maps
                 mapLink.href = `http://maps.apple.com/?q=${addressQuery}`;
            } else {
                 // Open in Google Maps (Android/Desktop Windows etc)
                 mapLink.href = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
            }

        // *** For troubleshooting - Function to display the current window size - add p tag with class size in index.html
        /*    function showWindowSize() {
                try {
                     width = window.innerWidth;
                     height = window.innerHeight;

                    document.getElementById('size').textContent =
                    `${width}px by ${height}px`;
                } catch (error) {
                    console.error("Error getting window size:", error);
                }
            }

            // Run on page load
            showWindowSize();

            // Update when the window is resized
            window.addEventListener('resize', showWindowSize);*/
});