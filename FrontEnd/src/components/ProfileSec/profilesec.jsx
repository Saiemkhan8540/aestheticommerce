
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchUserProfile, updateUserProfile, updateAvatar } from '../../Redux/userSlice';
import { logoutUser } from '../../Redux/authSlice';

import './profilesec.css';
import { User, Package, Heart, MapPin, CreditCard, Star, TicketPercent, Settings, Store, LogOut } from "lucide-react";

const SELLER_API_URL = import.meta.env.VITE_SELLER_API_URL || 'http://localhost:5174';

const Profilesec = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { profile, status, error } = useSelector((state) => state.profile);
  const { token: authToken } = useSelector((state) => state.user);


  const [avatar, setAvatar] = useState("https://randomuser.me/api/portraits/men/32.jpg");
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [editProfile, setEditProfile] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [addressErrors, setAddressErrors] = useState({});


  const [formData, setFormData] = useState({

    fullname: "",
    email: "",
    phone: "",

    city: "",
    country: "",
    postalCode: ""

  });



  /* ---------------- Avatar Change ---------------- */

  const HandleImageChange = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setAvatar(reader.result);
    };

    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("avatar", file);
    try {
      setAvatarLoading(true);
      await dispatch(updateAvatar(formData));
    } catch (error) {
      console.log("Avatar upload failed :", error);
      alert("Failed to upload. Try JPG/PNG format!");
    } finally {
      setAvatarLoading(false);
    }
  };


  /* ---------------- Fetch Profile ---------------- */

  useEffect(() => {

    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;

    if (token) {
      dispatch(fetchUserProfile(token));
    }

  }, [dispatch]);


  /* ---------------- Fill Form Data ---------------- */

  useEffect(() => {

    if (profile) {

      setFormData({

        fullname: `${profile?.fullname?.firstname || ""} ${profile?.fullname?.lastname || ""}`,
        email: profile?.email || "",
        phone: profile?.phone || "",

        city: profile?.address?.city || "",
        country: profile?.address?.country || "",
        postalCode: profile?.address?.postalCode || ""

      });

    }

  }, [profile]);

  /*-----------------Validate <Phone---------------------*/
  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return "Please enter a 10 digit valid phone number"
    }
    return ("");
  }


  /*-------------Validate Address-------------------------------*/
  const validateAddress = () => {
    const errors = {};
    if (!formData.country.trim()) errors.country = "Country name is required"
    if (!formData.city.trim()) errors.city = "City name is required"
    if (!formData.postalCode.trim())
      errors.postalCode = "Postal code is rquired"
    else if (!/^\d{6}$/.test(formData.postalCode))
      errors.postalCode = "Enter 6 digit valid  postal code";

    return errors;
  }



  /* ---------------- Update Profile ---------------- */

  const handleUpdateProfile = () => {
    if (!formData.fullname.trim().includes(" ")) {
      setNameError("Please enter both first and last name with a space");
      return;
    }
    setNameError("");
    const parts = formData.fullname.trim().split(" ").filter(part => part !== "");
    const firstname = parts[0] || "";
    const lastname = parts.slice(1).join(" ") || "";
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }
    setPhoneError("");

    try {
      dispatch(updateUserProfile({


        firstname,
        lastname,
        email: formData.email,
        phone: formData.phone

      })).unwrap();

      setEditProfile(false);
      console.log("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      console.error("Failed to update profile.");
    }

  };


  /* ---------------- Update Address ---------------- */

  const handleUpdateAddress = async () => {
    const errors = validateAddress();
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }
    setAddressErrors({});


    try {
      await dispatch(updateUserProfile({


        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode

      })).unwrap();
      setEditAddress(false);
      console.log("Address updated successfully!");

    } catch (error) {
      console.error(error);
      console.log("Failed to update address.");
    }
  };


  /* ---------------- Logout ---------------- */

  const handleSignOut = () => {

    dispatch(logoutUser());
    localStorage.removeItem('token');
    navigate('/');

  };


  /* ---------------- Redirect ---------------- */

  useEffect(() => {

    if (status === 'idle' && !authToken) {
      navigate('/login');
    }

    if (status === 'failed') {
      navigate('/login');
    }

  }, [status, authToken, navigate]);


  if (status == 'loading') return <p>Loading profile...</p>;
  if (status == 'failed') return <p>Error loading profile: {error}</p>;



  return (

    <div className="profile-layout">

      {/* Sidebar */}

      <aside className="sidebar">

        <nav className="sidebar-nav">

          <ul>

            <li className="active"><User /><span>My Profile</span></li>
            <li>
              <Link to="/OrderList"><Package /><span>Orders</span></Link>
            </li>
            <li>
              <Link to="/favorites"><Heart />
                <span>Wishlist</span></Link>
            </li>
            <li>
              <Link to="/AddressList"><MapPin /><span>Addresses</span></Link>
            </li>

            {/* <li><CreditCard /><span>Payment Methods</span></li>

            <li><Star /><span>Reviews</span></li>

            <li><TicketPercent /><span>Coupons</span></li> */}

            <li><Settings /><span>Settings</span></li>
            <li>
              <a href={`${SELLER_API_URL}/register`}>
                <Store /><span>Become a Seller</span>
              </a>
            </li>


            <li className="sign-out-btn" onClick={handleSignOut}>
              <LogOut /><span>Sign Out</span>
            </li>

          </ul>

        </nav>

        <footer className="sidebar-footer">

          <div className="user-mini">

            <img src={profile?.avatar || avatar} alt="User avatar" />

            <div>
              <span className="user-name">
                {profile?.fullname?.firstname} {profile?.fullname?.lastname}
              </span>

              <span className="user-email">
                {profile?.email}
              </span>

            </div>

          </div>

        </footer>

      </aside>



      {/* Main */}

      <main className="profile-main">


        {/* Profile Header */}

        <header className="profile-header">

          <div>

            <h2>My Profile</h2>
            <span className="profile-role">Customer</span>

          </div>

          <div className="profile-meta">

            <span>
              Last login: {new Date().toLocaleDateString("en-GB", {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>

          </div>

        </header>

        {/* Avatar Section */}
        <section className="profile-section profile-user">

          <div className="profile-user-container">

            <div className="avatar-wrapper">

              <img
                className="profile-avatar"
                src={profile?.avatar || avatar}
                alt="avatar"
                style={{ opacity: avatarLoading ? 0.5 : 1 }}
              />

              <label className="avatar-edit-btn">
                {avatarLoading ? "Uploading..." : "Edit Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={HandleImageChange}
                  hidden
                />
              </label>


            </div>

            <div className="profile-user-info">

              <h3>
                {profile?.fullname?.firstname} {profile?.fullname?.lastname}
              </h3>

              <span className="profile-email">
                {profile?.email}
              </span>

              <span className="profile-joined">
                Member since{" "}
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric"
                  })
                  : "N/A"}
              </span>

            </div>

          </div>

        </section>
        <section className="profile-section profile-info">

          <div className="profile-info-header">

            <h4>Personal Information</h4>

            <button
              className="edit-btn"
              onClick={() => setEditProfile(!editProfile)}
            >
              {editProfile ? "Cancel" : "Edit"}
            </button>

          </div>


          <div className="profile-info-grid">

            {/* Full Name */}

            <div className="info-field">

              <label>Full Name</label>
              {editProfile ? (
                <>
                  <input
                    className={`profile-input ${nameError ? 'input-error' : ''}`}
                    value={formData.fullname}
                    onChange={(e) => {
                      setFormData({ ...formData, fullname: e.target.value });
                      setNameError("");
                    }}
                  />
                  {nameError && <span className="error-msg">{nameError}</span>}
                </>
              ) : (
                <span>{profile?.fullname?.firstname} {profile?.fullname?.lastname}</span>
              )}



            </div>


            {/* Email */}

            <div className="info-field">

              <label>Email</label>

              <span>{profile?.email}</span>

            </div>


            {/* Phone */}

            <div className="info-field">

              <label>Phone</label>

              {editProfile ? (
                <>
                  <input
                    className={`profile-input ${phoneError ? 'input-error' : ''}`}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value })
                      setPhoneError("")
                    }
                    }
                  />
                  {phoneError && <span className="error-msg">{phoneError}</span>}

                </>
              ) : (

                <span>{profile?.phone || "Not added"}</span>

              )}


            </div>


            {/* Joined */}

            <div className="info-field">

              <label>Joined</label>

              <span>

                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric"
                  })
                  : "N/A"}

              </span>

            </div>

          </div>


          {editProfile && (

            <div className="save-button-wrapper">

              <button
                className="save-btn"
                onClick={handleUpdateProfile}
              >
                Save Changes
              </button>

            </div>

          )}

        </section>


        {/* Address Section */}
        <section className="profile-section profile-address">
          <div className='profile-info-header'>
            <h4>Default Address</h4>
            <button className='edit-btn' onClick={() => setEditAddress(!editAddress)}>
              {editAddress ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="profile-info-grid">

            {/* Country */}
            <div className="info-field">
              <label>Country</label>
              {editAddress ? (
                <>
                  <input
                    className={`profile-input ${addressErrors.country ? 'input-error' : ''}`}
                    value={formData.country}
                    onChange={(e) => {
                      setFormData({ ...formData, country: e.target.value });
                      setAddressErrors({ ...addressErrors, country: "" });
                    }}
                  />
                  {addressErrors.country && <span className="error-msg">{addressErrors.country}</span>}
                </>
              ) : (
                <span>{profile?.address?.country || "Not added"}</span>
              )}
            </div>

            {/* City */}
            <div className="info-field">
              <label>City</label>
              {editAddress ? (
                <>
                  <input
                    className={`profile-input ${addressErrors.city ? 'input-error' : ''}`}
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      setAddressErrors({ ...addressErrors, city: "" });
                    }}
                  />
                  {addressErrors.city && <span className="error-msg">{addressErrors.city}</span>}
                </>
              ) : (
                <span>{profile?.address?.city || "Not added"}</span>
              )}
            </div>

            {/* Postal Code */}
            <div className="info-field">
              <label>Postal Code</label>
              {editAddress ? (
                <>
                  <input
                    className={`profile-input ${addressErrors.postalCode ? 'input-error' : ''}`}
                    value={formData.postalCode}
                    onChange={(e) => {
                      setFormData({ ...formData, postalCode: e.target.value });
                      setAddressErrors({ ...addressErrors, postalCode: "" });
                    }}
                  />
                  {addressErrors.postalCode && <span className="error-msg">{addressErrors.postalCode}</span>}
                </>
              ) : (
                <span>{profile?.address?.postalCode || "Not added"}</span>
              )}
            </div>

          </div>

          {editAddress && (
            <div className="save-button-wrapper">
              <button className="save-btn" onClick={handleUpdateAddress}>
                Save Changes
              </button>
            </div>
          )}
        </section>

      </main>

    </div>

  );

};

export default Profilesec;