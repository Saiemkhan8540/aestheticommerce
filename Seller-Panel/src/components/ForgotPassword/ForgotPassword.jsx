import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import "./ForgotPassword.css";
import logo from "../../Images/Asset9.png"; // make sure the path is correct
import { forgotPasswordSeller } from "../../Redux/authSlice";

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const {seller, isLoading, isError, message} = useSelector((state) => state.auth);

    const handleSubmit=(e)=>{
        e.preventDefault();
        setIsSubmitted(true);
        dispatch(forgotPasswordSeller(email));
    }

    useEffect(() => {
        const expiry = seller?.otpExpiresAt
            ? new Date(seller.otpExpiresAt).getTime()
            : 0;
        // console.log("Checking redirect conditions in ForgotPassword useEffect:- ", seller, " | Expiry:- ", seller, " | Current Time:- ", Date.now(), " | IsSubmitted:- ", isSubmitted);

        if (seller && expiry > Date.now() && isSubmitted) {
          // console.log("Redirecting to /verification-otp with email:- ", email);
            navigate('/verification-otp', {
                state: { email: email }
            });

            setIsSubmitted(false);
        }
    }, [seller, navigate, email, isSubmitted]); // Added isSubmitted to dependencies

  return (
    <div className="wrapper">
      <div className="container">
        <div className="logoContainer">
          <img src={logo} alt="App Logo" className="logo" />
        </div>

        <h2 className="title">Forgot Password</h2>
        {isError && <p className="error">{message}</p>}
        {isLoading && <p className="loading">Loading...</p>}

        <form onSubmit={handleSubmit}>
          <div className="inputGroup">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="button" disabled={isLoading}>
            {/* {isLoading ? "Login" : "Loading..."} */}
            Send OTP
          </button>
        </form>

        <p className="registerText">
          New Seller?{" "}
          <Link to="/register" className="registerLink">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
