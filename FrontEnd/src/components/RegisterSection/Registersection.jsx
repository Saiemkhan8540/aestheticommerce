// User fills form ➡️ frontend dispatches Redux action (like `registerUser`) ➡️ Redux action sends data to backend API ➡️ backend saves user in MongoDB and returns `{ user, token }` ➡️ Redux reducer (`authSlice`) stores user and token in Redux store ➡️ optionally, `authSlice` also updates localStorage with the user and token.
 

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Registersection.css';

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../Redux/authSlice'; // adjust path as needed

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const { user, token, loading, error } = useSelector((state) => state.user);

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      fullname: {
        firstname: firstName,
        lastname: lastName,
      },
      email,
      password,
    };
    dispatch(registerUser(user));
  };

  useEffect(() => {
    if (user && token) {
      navigate('/');
    }
  }, [user, token, navigate]);

  return (
    <div className="register-background">
      <div className="register-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <label>First Name</label>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            type="text"
            placeholder="Enter your first name"
          />

          <label>Last Name</label>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            type="text"
            placeholder="Enter your last name"
          />

          <label>Email</label>
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter your email"
          />

          <label>Password</label>
          <div className="password-wrapper">
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        <p>
          Have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
