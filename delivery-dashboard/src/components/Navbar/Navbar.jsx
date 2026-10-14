import React, { useState } from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../Redux/authSlice';
import logo from "../../Images/Asset9.png";
import { updateAvailabilityAPI } from '../../services/deliveryService';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async() => {
    try{
      await updateAvailabilityAPI(false);
    } catch(err){
      console.log("Availability update failed");
    }
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo-link">
          <img src={logo} alt="Aestheticommerce" className="navbar-logo-img" />
          <h2 className="navbar-logo-text">estheticommerce</h2>
        </Link>
      </div>
      <div className="headernav">
        <div>
          <Link to="/"><h1 className="titlenav">Delivery Dashboard</h1></Link>

          {/* <a href="/" className="titlenav">Delivery Dashboard</a> */}
          {/* <p className="subtitlenav">Track and manage all your orders in one place</p> */}
        </div>
      </div>
      <div className="navbar-right">
        <div className="profile-container" onClick={() => setShowDropdown(!showDropdown)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="profile-icon"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>

          {showDropdown && (
            <div className="profile-dropdown">
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;