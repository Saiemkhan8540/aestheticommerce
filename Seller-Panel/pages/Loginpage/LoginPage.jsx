import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../src/components/LoginForm/LoginForm";
import { loginSeller, resetAuthState } from "../../src/Redux/authSlice";
// import "./LoginPage.css";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { seller, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  );

  const handleLogin = (data) => {
    dispatch(loginSeller(data));
  };

  useEffect(() => {
    if (isSuccess && seller) {
      navigate("/home");
    }
  }, [isSuccess, seller, navigate]);

  useEffect(() => {
    return () => {
      dispatch(resetAuthState());
    };
  }, []);

return (
  <div className="login-page">
    <div className="login-box">
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        isError={isError}
        message={message}
      />
    </div>
  </div>
);
};

export default LoginPage;
