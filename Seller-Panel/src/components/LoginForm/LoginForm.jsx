import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./LoginForm.module.css";
import logo from "../../Images/Asset9.png"; // make sure the path is correct

const SellerLogin = ({ onSubmit, isLoading = false, isError = false, message = "" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ email, password });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="App Logo" className={styles.logo} />
        </div>

        <h2 className={styles.title}>Seller Login</h2>
        {isError && message && <p className={styles.error}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
          <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
          <label className={styles.label}>Password</label>
            <input
                  type= {showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  required
                />
                 <span
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
          </div>
          <div className={styles.forgotPasswordLinkContainer}>
            <Link to="/forgot-password" className={styles.forgotPasswordLink}>Forgot Password?</Link>
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className={styles.registerText}>
          New Seller?{" "}
          <Link to="/register" className={styles.registerLink}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SellerLogin;
