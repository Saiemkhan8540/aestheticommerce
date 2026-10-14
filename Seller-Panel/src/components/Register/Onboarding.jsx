// src/components/SellerRegistration/SellerRegistration.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSellerOnboardingCompleted } from "../../Redux/authSlice";
import "./Register.css";
const API_URL = import.meta.env.VITE_API_URL;
const OnboardingStep = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [sellerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [_, setErrors] = useState({});

  const [onboardingStep, setOnboardingStep] = useState(1);

  const [formData, setFormData] = useState({
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
      postalCode: "",
    },
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      upiId: "",
      paymentCycle: "monthly",
    },
    aadharNumber: "",
    aadharFile: null,
    panNumber: "",
    panFile: null,
    addressProof: "",
  });

  const [verificationMode, setVerificationMode] = useState({
    aadhar: "number",
    pan: "number",
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
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  //file handlers
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const toggleVerificationMode = (field, mode) => {
    setVerificationMode((prev) => ({ ...prev, [field]: mode }));
    setFormData((prev) => ({
      ...prev,
      ...(field === "aadhar" && {
        aadharNumber: mode === "number" ? prev.aadharNumber : "",
        aadharFile: mode === "file" ? prev.aadharFile : null,
      }),
      ...(field === "pan" && {
        panNumber: mode === "number" ? prev.panNumber : "",
        panFile: mode === "file" ? prev.panFile : null,
      }),
    }));
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    console.log("submit succesfuuly");

    try {
      const token = localStorage.getItem("sellerToken");
      const storedSellerId = sellerId || localStorage.getItem("sellerId");
      console.log(storedSellerId);

      if (!storedSellerId) {
        setErrors({
          general: "Seller ID missing. Please restart registration.",
        });
        setLoading(false);
        return;
      }

      const fd = new FormData();

      // Must send sellerId
      fd.append("sellerId", storedSellerId);

      // Append basic info
      fd.append("sellerName", formData.sellerName || "");
      fd.append("storeName", formData.storeName || "");
      fd.append("bio", formData.bio || "");
      fd.append("role", "seller");
      fd.append("status", "pending");

      // Business info
      fd.append("businessType", formData.businessType || "individual");
      fd.append("gstNumber", formData.gstNumber || "");
      fd.append("registrationNumber", formData.registrationNumber || "");
      fd.append("businessAddress", JSON.stringify(formData.businessAddress));

      // Bank info
      fd.append("bankDetails", JSON.stringify(formData.bankDetails));

      // Verification
      fd.append("aadharNumber", formData.aadharNumber || "");
      if (formData.aadharFile) fd.append("aadharFile", formData.aadharFile);
      fd.append("panNumber", formData.panNumber || "");
      if (formData.panFile) fd.append("panFile", formData.panFile);
      fd.append("addressProof", formData.addressProof || "");

      // Onboarding flag
      fd.append("onboardingCompleted", "true");

      // Debug: check FormData content
      // for (let pair of fd.entries()) console.log(pair[0], pair[1]);

      const response = await axios.post(
        `${API_URL}/api/seller/onboarding`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      dispatch(setSellerOnboardingCompleted());

      alert(response.data.message);
      navigate("/home");
    } catch (err) {
      console.log(err.response?.data); // 🔹 log backend error for debugging
      const message = err?.response?.data?.message || "Onboarding failed";
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () =>
    onboardingStep < 4 && setOnboardingStep(onboardingStep + 1);
  const prevStep = () =>
    onboardingStep > 1 && setOnboardingStep(onboardingStep - 1);
  return (
    <div className="registration-container">
      <div className="form-card">
        <h2>Seller Onboarding</h2>
        {loading && (
          <div className="loading-status">
            <div className="loading-spinner" />
            <span>Processing your onboarding...</span>
          </div>
        )}
        <form onSubmit={handleOnboardingSubmit}>
          {onboardingStep === 1 && (
            <>
              <h3>Basic Info</h3>
              <input
                type="text"
                name="sellerName"
                placeholder="Full Name"
                value={formData.sellerName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="storeName"
                placeholder="Store Name"
                value={formData.storeName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="bio"
                placeholder="Bio"
                value={formData.bio}
                onChange={handleChange}
              />
            </>
          )}
          {onboardingStep === 2 && (
            <>
              <h3>Business Info</h3>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
              >
                <option value="individual">Individual</option>
                <option value="partnership">Partnership</option>
                <option value="private_limited">Private Limited</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                name="gstNumber"
                placeholder="GST Number"
                value={formData.gstNumber}
                onChange={handleChange}
              />
              <input
                type="text"
                name="registrationNumber"
                placeholder="Registration Number"
                value={formData.registrationNumber}
                onChange={handleChange}
              />
              <input
                type="text"
                name="businessAddress.street"
                placeholder="Street"
                value={formData.businessAddress.street}
                onChange={handleChange}
              />
              <input
                type="text"
                name="businessAddress.city"
                placeholder="City"
                value={formData.businessAddress.city}
                onChange={handleChange}
              />
              <input
                type="text"
                name="businessAddress.state"
                placeholder="State"
                value={formData.businessAddress.state}
                onChange={handleChange}
              />
              <input
                type="text"
                name="businessAddress.country"
                placeholder="Country"
                value={formData.businessAddress.country}
                onChange={handleChange}
              />
              <input
                type="text"
                name="businessAddress.postalCode"
                placeholder="Postal Code"
                value={formData.businessAddress.postalCode}
                onChange={handleChange}
              />
            </>
          )}
          {onboardingStep === 3 && (
            <>
              <h3>Bank Info</h3>
              <input
                type="text"
                name="bankDetails.accountNumber"
                placeholder="Account Number"
                value={formData.bankDetails.accountNumber}
                onChange={handleChange}
              />
              <input
                type="text"
                name="bankDetails.ifscCode"
                placeholder="IFSC Code"
                value={formData.bankDetails.ifscCode}
                onChange={handleChange}
              />
              <input
                type="text"
                name="bankDetails.accountHolderName"
                placeholder="Account Holder Name"
                value={formData.bankDetails.accountHolderName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="bankDetails.upiId"
                placeholder="UPI ID"
                value={formData.bankDetails.upiId}
                onChange={handleChange}
              />
            </>
          )}
          {onboardingStep === 4 && (
            <>
              <h3>Verification</h3>
              <div className="verification-group">
                <label className="verification-label">Aadhar</label>

                <div className="verification-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${verificationMode.aadhar === "number" ? "active" : ""}`}
                    onClick={() => toggleVerificationMode("aadhar", "number")}
                  >
                    Enter Number
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${verificationMode.aadhar === "file" ? "active" : ""}`}
                    onClick={() => toggleVerificationMode("aadhar", "file")}
                  >
                    Upload File
                  </button>
                </div>

                {verificationMode.aadhar === "number" ? (
                  <input
                    type="text"
                    name="aadharNumber"
                    placeholder="Aadhar Number"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    type="file"
                    name="aadharFile"
                    onChange={handleFileChange}
                  />
                )}
              </div>
              <div className="verification-group">
                <label className="verification-label">PAN</label>

                <div className="verification-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${verificationMode.pan === "number" ? "active" : ""}`}
                    onClick={() => toggleVerificationMode("pan", "number")}
                  >
                    Enter Number
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${verificationMode.pan === "file" ? "active" : ""}`}
                    onClick={() => toggleVerificationMode("pan", "file")}
                  >
                    Upload File
                  </button>
                </div>

                {verificationMode.pan === "number" ? (
                  <input
                    type="text"
                    name="panNumber"
                    placeholder="PAN Number"
                    value={formData.panNumber}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    type="file"
                    name="panFile"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                )}
              </div>

              <input
                type="text"
                name="addressProof"
                placeholder="Address Proof (URL)"
                value={formData.addressProof}
                onChange={handleChange}
              />
            </>
          )}

          <div className="form-navigation">
            {onboardingStep > 1 && (
              <button type="button" onClick={prevStep}>
                Back
              </button>
            )}
            {onboardingStep < 4 && (
              <button type="button" onClick={nextStep}>
                Next
              </button>
            )}
            {onboardingStep === 4 && (
              <button type="submit">Complete Onboarding</button>
            )}
          </div>
          <p>Step {onboardingStep} of 4</p>
        </form>
      </div>
    </div>
  );
};
export default OnboardingStep;
