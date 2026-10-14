import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { verifyToken } from "./Redux/authSlice";
import "./App.css";
import DeliveryPanel from "./components/DeliveryPanel/DeliveryPanel.jsx";
import { OrderDetail } from "./pages/DeliveryPage/Deliverycomplete.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import Login from "./components/Login/Login.jsx";
import Register from "./components/Register/Register.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // This CSS is required!

function App() {
  const dispatch = useDispatch();
  const { isDelivery } = useSelector((state) => state.auth);

  React.useEffect(() => {
    const token = localStorage.getItem("deliveryToken");

    if (token) {
      dispatch(verifyToken());
    }
  }, [dispatch]);

  // if (loading) return <div>Loading...</div>;

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={isDelivery ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={isDelivery ? <Navigate to="/" /> : <Register />}
          />
          <Route
            path="/"
            element={
              isDelivery ? (
                <>
                  <Navbar />
                  <DeliveryPanel />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/order/:orderId/:itemId"
            element={
              isDelivery ? (
                <>
                  <Navbar />
                  <OrderDetail />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
