const firebaseConfig = {
  apiKey: "AIzaSyB5jaPVkCwxXiMYhSn0uuW9QSMc-B5C9YY",
  authDomain: "mjsmartapps.firebaseapp.com",
  databaseURL: "https://mjsmartapps-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mjsmartapps",
  storageBucket: "mjsmartapps.firebasestorage.app",
  messagingSenderId: "1033240518010",
  appId: "1:1033240518010:web:930921011dda1bd56e0ac3",
  measurementId: "G-959VLQSHH2"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();

// Global variable to store the confirmation result object
let confirmationResult = null; 


/* ----------------------------------------------------
    1. index.html (Login Page) Logic
---------------------------------------------------- */
if (document.getElementById('send-otp-btn')) {

    const phoneInput = document.getElementById('phone');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const otpInput = document.getElementById('otp');
    const phoneForm = document.getElementById('phone-form');
    const otpForm = document.getElementById('otp-form');
    const statusMessage = document.getElementById('status-message');
    const errorMessage = document.getElementById('error-message');

    // ** SETUP: Initialize reCAPTCHA Verifier **
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'normal', // Ensure this is 'normal' or 'invisible'
        'callback': (response) => {
            statusMessage.textContent = "reCAPTCHA Verified! Ready to send code.";
        },
        'expired-callback': () => {
            errorMessage.textContent = "reCAPTCHA expired. Please retry.";
        }
    }, auth);

    // ** Handler for "Send OTP" button **
    sendOtpBtn.addEventListener('click', async () => {
        const phoneNumber = phoneInput.value.trim();
        statusMessage.textContent = "";
        errorMessage.textContent = "";

        if (!phoneNumber || phoneNumber.length < 10) {
            errorMessage.textContent = "Please enter a complete phone number (e.g., +15551234567).";
            return;
        }

        try {
            statusMessage.textContent = "Sending verification code...";
            
            const appVerifier = window.recaptchaVerifier;
            confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
            
            // Success UI update
            phoneForm.style.display = 'none';
            otpForm.style.display = 'block';
            statusMessage.textContent = "Code sent to " + phoneNumber + ". Enter the 6-digit code below.";
            
        } catch (error) {
            statusMessage.textContent = "";
            console.error("Error during SMS sending:", error);
            let userFriendlyError = "An authentication error occurred. Please try again.";
            if (error.code === 'auth/invalid-phone-number') {
                userFriendlyError = "Invalid phone number format. Include the country code (e.g., +1...).";
            } else if (error.code === 'auth/captcha-check-failed' || error.code === 'auth/web-storage-unsupported') {
                 userFriendlyError = "Verification failed. Ensure you are running on a secure domain (localhost or HTTPS).";
            }
            errorMessage.textContent = userFriendlyError;
            
            // Reset reCAPTCHA on failure
            window.recaptchaVerifier.render().then(function(widgetId) {
                grecaptcha.reset(widgetId);
            });
        }
    });

    // ** Handler for "Verify and Login" button **
    verifyOtpBtn.addEventListener('click', async () => {
        const otpCode = otpInput.value.trim();
        statusMessage.textContent = "";
        errorMessage.textContent = "";

        if (!otpCode || otpCode.length !== 6 || !confirmationResult) {
            errorMessage.textContent = "Please enter the 6-digit code correctly.";
            return;
        }

        try {
            statusMessage.textContent = "Verifying code...";
            
            const result = await confirmationResult.confirm(otpCode);
            const user = result.user;
            
            // Redirect on success
            window.location.href = 'home.html';

        } catch (error) {
            statusMessage.textContent = "";
            console.error("Error during OTP verification:", error);
            let userFriendlyError = "The code is invalid or has expired. Please try resending.";
            if (error.code === 'auth/invalid-verification-code') {
                userFriendlyError = "Incorrect verification code. Please check and try again.";
            }
            errorMessage.textContent = userFriendlyError;
        }
    });
}


/* ----------------------------------------------------
    2. home.html (Home Page) Logic & Global Auth Check
---------------------------------------------------- */

auth.onAuthStateChanged((user) => {
    // Check if on Login Page
    if (document.getElementById('send-otp-btn')) {
        if (user) {
            window.location.href = 'home.html';
        }
    } 
    // Check if on Home Page
    else if (document.getElementById('logout-btn')) {
        const userInfo = document.getElementById('user-info');
        if (!user) {
            window.location.href = 'index.html';
        } else {
            userInfo.textContent = "Logged in as: " + (user.phoneNumber || user.uid);
        }
    }
});


// ** Handler for "Logout" button **
if (document.getElementById('logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await auth.signOut();
            // Listener handles the redirect
        } catch (error) {
            console.error("Error signing out:", error);
        }
    });
}