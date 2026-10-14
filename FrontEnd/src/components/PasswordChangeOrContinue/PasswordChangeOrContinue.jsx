import React, { useEffect } from "react";
import "./PasswordChangeOrContinue.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { restoreUserFromSession } from "../../Redux/authSlice";

const PasswordChangeOrContinue = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);
  console.log(
    "PasswordChangeOrContinue component - user and token from Redux:- ",
    user,
    token,
  );

  useEffect(() => {
    if (!token) {
      const tempSession = sessionStorage.getItem("tempUser");
      // console.log("Checking temp session on PasswordChangeOrContinue:- ", tempSession);

      if (tempSession) {
        const parsedData = JSON.parse(tempSession);
        dispatch(restoreUserFromSession(parsedData));
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [token, dispatch, navigate]);

  const handlerChangePassword = () => {
    // console.log("Redirecting to Change Password page...",user, token);
    navigate("/change-password");
  };

  const handleContinue = () => {
    const tempSession = sessionStorage.getItem("tempUser");
    let dataToSave = null;
    // console.log("Continuing to Dashboard with user and token:- ", user, token, " | Temp Session:- ", tempSession);

    if (token && user) {
      dataToSave = { user, token };
    } else if (tempSession) {
      dataToSave = JSON.parse(tempSession);
    }
    console.log("Data to save on Continue:- ", dataToSave);

    if (dataToSave) {
      localStorage.setItem("user", JSON.stringify(dataToSave));

      sessionStorage.removeItem("tempUser");

      navigate("/");
    }
  };

  if (!token && !sessionStorage.getItem("tempUser")) {
    return null;
  }

  return (
    <div className="passwordOption-background">
      <div className="passwordOption-container">
        <h2>Password Change or Continue</h2>
        <div>
          <button onClick={handlerChangePassword} className="option-btn">
            Change Password
          </button>

          <p>or</p>

          <button onClick={handleContinue} className="option-btn">
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeOrContinue;
