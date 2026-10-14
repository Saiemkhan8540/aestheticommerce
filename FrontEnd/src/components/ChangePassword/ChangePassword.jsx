import React, { useState, useEffect } from "react";
import "./ChangePassword.css";
import { useDispatch, useSelector } from "react-redux";
import {
  resetPassword,
  restoreUserFromSession,
  logoutUser,
} from "../../Redux/authSlice";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, loading, error, token } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      const tempSession = sessionStorage.getItem("tempUser");
      if (tempSession) {
        dispatch(restoreUserFromSession(JSON.parse(tempSession)));
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [token, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      setLocalError("Password must be at least 6 characters long!");
      return;
    }

    if (user && user.email) {
      dispatch(
        resetPassword({
          email: user.email,
          newPassword,
          confirmPassword,
          token,
        }),
      )
        .unwrap()
        .then(() => {
          // console.log("Password Changed Successfully");

          dispatch(logoutUser()); // <--- Clears Redux State (user/token = null)
          sessionStorage.removeItem("tempUser"); // Clears Session

          navigate("/login");
        })
        .catch((err) => {
          setLocalError(err || "Failed to reset password");
        });
    }
  };

  if (!token && !sessionStorage.getItem("tempUser")) return null;

  return (
    <div className="changePassword-background">
      <div className="changePassword-container">
        <h2>Enter your Password</h2>
        <form onSubmit={handleSubmit}>
          <label>New Password</label>
          <div className="password-wrapper">
            <input
              required
              value={password}
              onChange={(e) => setNewPassword(e.target.value)}
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter your password"
            />
            <span
              className="toggle-password"
              onClick={() => setShowNewPassword(!showPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input
              required
              value={password}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Enter your password"
            />
            <span
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </button>

          {/* Display Local Errors (Validation) */}
          {localError && <p className="error-msg">{localError}</p>}

          {/* Display API Errors (Redux) */}
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
