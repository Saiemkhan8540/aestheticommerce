import React, { useEffect, useRef, useState } from "react";
import "./VerificationOtp.css";
import { useLocation, useNavigate } from "react-router-dom";
import { ForgotPassword, verifOtp } from "../../Redux/authSlice";
import { useDispatch, useSelector } from "react-redux";

const VerificationOtp = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, error, token } = useSelector((state) => state.user);
  const inputRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) {
      navigate("/forgot-password");
    }
  }, [location.state, navigate]);

  // 1. Calculate the target time safely
  const expiryTime = user?.forgot_password_expiry
    ? new Date(user.forgot_password_expiry).getTime()
    : 0;

  // console.log("expiryTime:- ", user.forgot_password_expiry," : ",new Date(user?.forgot_password_expiry).getTime(),":- ", Date.now()," |:- ",Math.floor((Date.now() - expiryTime) / 1000));
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
  }, [user?.forgot_password_expiry]);

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
      console.log("otp:- ", otps);
      const email = location.state?.email || location.state;
      dispatch(verifOtp({ email, otp: otps }));
    }
  };

  useEffect(() => {
    if (user && token) {
      navigate("/password-change-continue"); // redirect to homepage after login
    }
  }, [user, token]);

  const resendOtp = () => {
    // console.log("Resend OTP clicked");
    const email = location.state?.email || location.state;

    dispatch(ForgotPassword({ email: email }));

    setOtp(["", "", "", "", "", ""]);
  };

  // Helper to format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="verifyOtp-background">
      <div className="verifyOtp-container">
        <h2>Verification OTP</h2>
        <form onSubmit={handleSubmit}>
          <label>Enter OTP</label>
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
          <button className="verify-otp-btu" type="submit" disabled={!validValue}>
            Verify OTP
          </button>
        </form>
        {error && <p className="error-msg">{error}</p>}
        <div className="resend-container">
          <p className="remain-time">OTP Expire: {formatTime(timeLeft)}</p>

          <button
            className="resend-btn"
            onClick={resendOtp}
            disabled={timeLeft > 0}
          >
            Resend OTP
          </button>
          {/* {timeLeft === 0 ? (
            <p onClick={() => resendOtp()}>Resend OTP</p>
          ) : (
            <p>Please wait to resend...</p>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default VerificationOtp;
