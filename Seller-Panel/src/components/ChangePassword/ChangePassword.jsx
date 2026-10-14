import React, { useEffect, useState } from 'react'
import styles from "./ChangePassword.module.css";
import logo from "../../Images/Asset9.png"; // make sure the path is correct
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { logoutSeller, resetAuthState, resetPasswordSeller, restoreSellerFromSession } from '../../Redux/authSlice';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { seller, isLoading, isError, message, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      const tempSession = sessionStorage.getItem("tempSeller");
      if (tempSession) {
        dispatch(restoreSellerFromSession(JSON.parse(tempSession)));
      } else {
        navigate("/login");
      }
    }
  }, [token, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
        // alert("Confirm password does not match new password!");
      setLocalError("Confirm password does not match new password!");
      return;
    }

    if (newPassword.length < 6) {
        // alert("Password must be at least 6 characters long!");
      setLocalError("Password must be at least 6 characters long!");
      return;
    }

    if (seller && seller.email) {
      dispatch(
        resetPasswordSeller({
          email: seller.email,
          newPassword,
        }),
      )
        .unwrap()
        .then(() => {
          // console.log("Password Changed Successfully");

          dispatch(logoutSeller()); // <--- Clears Redux State (user/token = null)
          sessionStorage.removeItem("tempSeller"); // Clears Session

          navigate("/login");
        })
        .catch((err) => {
          setLocalError(err || "Failed to reset password");
        });
    }
  };

  if (!token && !sessionStorage.getItem("tempSeller")) return null;

  return (
    <div className="wrapper">
      <div className="container">
        <div className="logoContainer">
          <img src={logo} alt="App Logo" className="logo" />
        </div>

        <h2 className="title">Enter your Password</h2>

        {localError && <p className="error">{localError}</p>}
        {isLoading && <p className="loading">Password changing...</p>}

        <form onSubmit={handleSubmit}>
          <label>New Password</label>
          <div className={styles.passwordInputContainer}>
            <input
                  type= {showPassword ? "text" : "password"}
                  name="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.passwordChangeInput}
                  required
                />
                 <span
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
          </div>

          <label>Confirm Password</label>
          <div className={styles.passwordInputContainer}>
            <input
                  type= {showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.passwordChangeInput}
                  required
                />
                 <span
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
          </div>

          <button className={styles.passwordChangeButton} disabled={isLoading}>
            {isLoading ? "Changing..." : "Change Password"}
          </button>

          {/* Display Local Errors (Validation) */}
          {/* {localError && <p className="error-msg">{localError}</p>} */}

          {/* Display API Errors (Redux) */}
          {/* {isError && <p className="error-msg">{isError}</p>} */}
        </form>
      </div>
    </div>
  );
}

export default ChangePassword