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
firebase.initializeApp(firebaseConfig);

window.onload = () => {
  renderRecaptcha();
};

function renderRecaptcha() {
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
    size: "normal",
  });
}

function sendOTP() {
  const phone = document.getElementById("phoneNumber").value;
  const appVerifier = window.recaptchaVerifier;

  firebase.auth().signInWithPhoneNumber(phone, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      alert("OTP Sent Successfully!");
    })
    .catch((error) => alert(error.message));
}

function verifyOTP() {
  const otp = document.getElementById("otp").value;

  window.confirmationResult
    .confirm(otp)
    .then(() => {
      window.location.href = "home.html";
    })
    .catch(() => alert("Invalid OTP, try again!"));
}
