import React, { useEffect } from "react";
import "./PasswordChangeOrContinue.css";
import logo from "../../Images/Asset9.png"; // make sure the path is correct
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { restoreSellerFromSession } from "../../Redux/authSlice";

const PasswordChangeOrContinue = () => {
const navigate = useNavigate();
  const dispatch = useDispatch();
  const { seller, token } = useSelector((state) => state.auth);
  console.log(
    "PasswordChangeOrContinue component - seller and token from Redux:- ",
    seller,
    token,
  );

  useEffect(() => {
    if (!token) {
      const tempSession = sessionStorage.getItem("tempSeller");

      if (tempSession) {
        const parsedData = JSON.parse(tempSession);
        dispatch(restoreSellerFromSession(parsedData));
      } else {
        navigate("/login");
      }
    }
  }, [token, dispatch, navigate]);

  const handlerChangePassword = () => {
    navigate("/change-password");
  };

  const handleContinue = () => {
    const tempSession = sessionStorage.getItem("tempSeller");
    let dataToSave = null;

    if (token && seller) {
      dataToSave = { seller, token };
    } else if (tempSession) {
      dataToSave = JSON.parse(tempSession);
    }
    console.log("Data to save on Continue:- ", dataToSave);

    if (dataToSave) {
      localStorage.setItem("sellerToken", dataToSave.token);

      sessionStorage.removeItem("tempSeller");

      navigate("/home");
    }
  };

  if (!token && !sessionStorage.getItem("tempSeller")) {
    return null;
  }

  return (
    <div className="wrapper">
      <div className="container">
        <div className="logoContainer">
          <img src={logo} alt="App Logo" className="logo" />
        </div>

        <h2 className="title">Password Change or Continue</h2>
        <div className="passwordHandler">
          <button onClick={handlerChangePassword}>
            Change Password
          </button>

          <p>or</p>

          <button onClick={handleContinue}>
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default PasswordChangeOrContinue