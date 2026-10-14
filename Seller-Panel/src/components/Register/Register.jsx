// src/components/SellerRegistration/SellerRegistration.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Register.css";


const API_URL = import.meta.env.VITE_API_URL;

const SellerRegistration = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("emailStep");
  const [sellerId, setSellerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpTimer, setOtpTimer] = useState(300);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    otp: "",
    // Step 2 fields
    sellerName: "",
    storeName: "",
    bio: "",
    businessType: "individual",
    gstNumber: "",
    registrationNumber: "",
    businessAddress: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: ""
    },
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      upiId: "",
      paymentCycle: "monthly"
    },
    aadharNumber: "",
    aadharFile: null,
    panNumber: "",
    panFile: null,
    addressProof: ""
  });

  const [verificationMode, setVerificationMode] = useState({
    aadhar: "number",
    pan: "number"
  });



  // --- Input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };




  const mapErrorToField = (message) => {
    const fieldErrors = {};

    if (!message) {
      fieldErrors.general = "Unable to process request. Please try again.";
      return fieldErrors;
    }

    const msg = message.toLowerCase();

    // ---- Email step ----
    if (msg.includes("email") && msg.includes("exists")) {
      fieldErrors.email = "This email is already registered";
    }
    else if (msg.includes("email")) {
      fieldErrors.email = "Please enter a valid email address";
    }
    else if (msg.includes("phone") && msg.includes("exists")) {
      fieldErrors.phone = "This phone number is already registered";
    }

    // ---- Phone ----
    else if (msg.includes("phone")) {
      fieldErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // ---- Password ----
    else if (msg.includes("password")) {
      fieldErrors.password = "Password does not meet requirements";
    }

    // ---- OTP ----
    else if (msg.includes("otp") && msg.includes("invalid")) {
      fieldErrors.otp = "Invalid OTP";
    }
    else if (msg.includes("otp") && msg.includes("expire")) {
      fieldErrors.otp = "OTP expired. Please resend OTP";
    }

    // ---- Fallback (controlled) ----
    else {
      fieldErrors.general = "Unable to process request. Please try again.";
    }

    return fieldErrors;
  };


  // ---------------- Step 1: Email + Phone + Password ----------------
  const handleEmailStepSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setErrors({ phone: "Phone number must be exactly 10 digits" });
      setLoading(false);
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!passwordRegex.test(formData.password.trim())) {
      setErrors({
        password:
          "Password must be at least 6 characters long and include uppercase, lowercase and a number",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/seller/register`, {
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      setSellerId(response.data.sellerId);
      localStorage.setItem("sellerId", response.data.sellerId); // Store in localStorage immediately
      setStep("otpStep");
      setOtpTimer(300);
    } catch (err) {
      let message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed";

      setErrors(mapErrorToField(message));


    } finally {
      setLoading(false);
    }
  };

  // ---------------- Step 2: OTP ----------------
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const storedSellerId = sellerId || localStorage.getItem("sellerId");
    if (!storedSellerId) {
      setErrors(mapErrorToField("Seller ID missing. Please restart registration."));
      setLoading(false);
      return;
    }
    const otp = formData.otp.trim();
    if (!otp) {
      setErrors({ otp: "Please enter the OTP" });
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/seller/verify-otp`,
        { sellerId: storedSellerId, emailOtp: formData.otp.trim() });
      localStorage.setItem("sellerToken", response.data.token);
      localStorage.setItem("sellerId", storedSellerId);
      if (response.data.isEmailVerified) {
        await new Promise(resolve => {
          alert("Email verified! Please login.");
          resolve();
        });
        navigate("/login");
      } else {
        const message = "Email verification failed";
        setErrors(mapErrorToField(message));
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Invalid OTP";
      setErrors(mapErrorToField(message));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setErrors({});
    try {
      await axios.post(`${API_URL}/api/seller/resent-otp`, { email: formData.email });
      setOtpTimer(300);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to resend OTP";
      setErrors(mapErrorToField(message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (step === "otpStep" && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);




  // ------------------- Render -------------------
  return (
    <div className="registration-container">
      <div className="form-card">

        <h2>Seller Registration & Onboarding</h2>

        {loading && <p>Loading...</p>}



        {/* Step 1 */}
        {step === "emailStep" && (
          <form onSubmit={handleEmailStepSubmit}>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <div className="error-slot">
              <span className={`error-text ${errors.email ? "show" : ""}`}>
                {errors.email || ""}
              </span>
            </div>

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onFocus={() =>
                setErrors((prev) => ({ ...prev, phone: "" }))
              }
              onChange={handleChange}
              required
            />
            <div className="error-slot">
              <span className={`error-text ${errors.phone ? "show" : ""}`}>
                {errors.phone || ""}
              </span>
            </div>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>


            <div className="error-slot">
              <span className={`error-text ${errors.password ? "show" : ""}`}>
                {errors.password || ""}
              </span>
            </div>

            <div className="error-slot">
              <span className={`error-text ${errors.general ? "show" : ""}`}>
                {errors.general || ""}
              </span>
            </div>

            <div className="form-navigation">
              <button type="submit">Send OTP</button>
            </div>

              <p className="login-text">
                Already have an account?{" "}
                <Link to="/login" className="login-link">
                  Login here
                </Link>
              </p>

          </form>
        )}




        {/* Step 2 */}
        {step === "otpStep" && (
          <form onSubmit={handleOtpSubmit}>

            <p>OTP sent to your email</p>

            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
              onFocus={() =>
                setErrors((prev) => ({ ...prev, otp: "" }))
              }
              required
            />
            <div className="error-slot">
              <span className={`error-text ${errors.otp ? "show" : ""}`}>
                {errors.otp || ""}
              </span>
            </div>

            <div className="error-slot">
              <span className={`error-text ${errors.general ? "show" : ""}`}>
                {errors.general || ""}
              </span>
            </div>

            <div className="form-navigation">
              <button type="submit">Verify OTP</button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpTimer > 0}
              >
                Resend OTP
              </button>
            </div>

            <div className="step-indicator">
              OTP expires in {Math.floor(otpTimer / 60)}:
              {("0" + (otpTimer % 60)).slice(-2)}
            </div>

          </form>
        )}

      </div>

    </div>


  )


};


export default SellerRegistration;

