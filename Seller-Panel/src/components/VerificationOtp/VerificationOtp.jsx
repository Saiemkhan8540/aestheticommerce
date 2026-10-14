import React, { use, useEffect, useRef, useState } from "react";
import './VerificationOtp.css'
import logo from "../../Images/Asset9.png"; // make sure the path is correct
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPasswordSeller, resetAuthState, verifOtp } from "../../Redux/authSlice";

const VerificationOtp = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const {seller, isLoading, isError, message, token} = useSelector((state) => state.auth);
  const inputRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) {
      navigate("/forgot-password");
    }
  }, [location.state, navigate]);

  // 1. Calculate the target time safely
  const expiryTime = seller?.otpExpiresAt
    ? new Date(seller.otpExpiresAt).getTime()
    : 0;

  // Helper to get current seconds remaining
  const getSecondsRemaining = () => {
    const seconds = Math.floor((expiryTime - Date.now()) / 1000);
    return Math.max(0, seconds);
  };

  // 2. Initialize State
  const [timeLeft, setTimeLeft] = useState(getSecondsRemaining());
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // 3. EFFECT: Sync timer when 'user' data updates from Redux (e.g. after Resend)
  useEffect(() => {
    setTimeLeft(getSecondsRemaining());
  }, [seller?.otpExpiresAt]);

  // 4. EFFECT: Countdown Logic
  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const validValue = otp.every((el) => el);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validValue) {
      const otps = otp.join("");
      const email = location.state?.email || location.state;
      dispatch(verifOtp({ email, otp: otps }));
    }
  };

  useEffect(() => {
    // console.log("Checking seller and token in VerificationOtp useEffect:- ", seller, " | ", token);
    if(seller && token) {
        navigate("/password-change-continue"); // redirect to homepage after login
    }

  }, [seller, token, navigate]);

  const resendOtp = () => {
    const email = location.state?.email || location.state;

    dispatch(forgotPasswordSeller(email));

    setOtp(["", "", "", "", "", ""]);
  };

  // Helper to format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  useEffect(() => {
    dispatch(resetAuthState());
  }, []);

  return (
    <div className="wrapper">
      <div className="container">
        <div className="logoContainer">
          <img src={logo} alt="App Logo" className="logo" />
        </div>

        <h2 className="title">Verification OTP</h2>

        {isError && <p className="error">{message}</p>}


        <form onSubmit={handleSubmit}>
          <label className="lable">Enter OTP</label>
          <div className="otp-inputs">
            {otp.map((data, index) => (
              <input
                key={"otp" + index}
                type="text"
                maxLength={1}
                ref={(ref) => {
                  inputRef.current[index] = ref;
                  return ref;
                }}
                value={data}
                onChange={(e) => {
                  const value = e.target.value;
                  const newOtp = [...otp];
                  newOtp[index] = value;
                  setOtp(newOtp);

                  if (value && index < otp.length - 1) {
                    inputRef.current[index + 1].focus();
                  }
                }}
              />
            ))}
          </div>
          <div className="verify-resend-container">
            <button type="submit" disabled={!validValue}>
              Verify OTP
            </button>
            <button
              type="button"
              disabled={timeLeft > 0}   // disable while timer is running
              onClick={resendOtp}
            >
              Resend OTP
            </button>
          </div>
        </form>
        <div className="timer">
          OTP Expires: {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  )
}

export default VerificationOtp