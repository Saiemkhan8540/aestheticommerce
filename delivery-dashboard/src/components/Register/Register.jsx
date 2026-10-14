import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerDelivery, clearError } from "../../Redux/authSlice";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [currentCity, setCurrentCity] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector(
    (state) => state.auth
  );

  // Clear old errors when component loads
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if registration successful
  // useEffect(() => {
  //   if (isDelivery) {
  //     alert("Registration successful! Please login.")
  //     navigate("/login", { replace: true });
  //   }
  // }, [isDelivery, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !password || !phone || !currentCity) {
    return alert("Please fill all fields");
  }

  if (!/^\d{10}$/.test(phone)) {
    return alert("Phone number must be exactly 10 digits");
  }

  if (password.length < 6) {
    return alert("Password must be at least 6 characters");
  }

    dispatch(
      registerDelivery({
        name,
        email,
        password,
        phone,
        currentCity,
      })
    )
      .unwrap()
      .then(() => {
        alert("Registration successful! Please login.");
        navigate("/login", { replace: true });
      })
      .catch((err) => {
         console.error(err);
       });
      };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2 className="login-title">Delivery Partner Register</h2>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label className="login-label">Full Name</label>
            <input
              type="text"
              className="login-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">Phone</label>
            <input
              type="text"
              className="login-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">Current City</label>
            <input
              type="text"
              className="login-input"
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              placeholder="Enter your city"
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">Email</label>
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">Password</label>
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="login-register-text">
          Already registered?{" "}
          <span
            className="login-register-link"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );

};

export default Register;