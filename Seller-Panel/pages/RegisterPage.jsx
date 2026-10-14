import React from "react";
import Register from "../src/components/Register/Register";
import { useDispatch, useSelector } from 'react-redux';
import { Link } from "react-router-dom"; // ✅ Import Link for internal navigation

const RegisterPage = () => {
  const dispatch = useDispatch();
  const value = useSelector((state) => state.test.value);

  return (
    <div>
      <Register />

    </div>
  );
};

export default RegisterPage;
