import React, { useState, useEffect } from "react";
import "./Address.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Address = ({ onAddressSubmit, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pincode: "",
    locality: "",
    address: "",
    city: "",
    state: "",
    addressType: "home",
  });

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) return;
    }

    if (name === "pincode") {
      if (!/^\d{0,6}$/.test(value)) return;
    }

    if (name === "name") {
      // Allow only letters and spaces
      if (!/^[A-Za-z\s]*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { name, phone, pincode, locality, address } = formData;

    if (!name || !phone || !pincode || !locality || !address) {
      toast.error("Please fill out all required fields.");
      return false;
    }

    if (phone.length !== 10) {
      toast.error("Phone number must be 10 digits.");
      return false;
    }

    if (pincode.length !== 6) {
      toast.error("Pincode must be 6 digits.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Call the parent component's callback with the address data
      if (onAddressSubmit) {
        onAddressSubmit(formData);
      }
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();

        const address = data.address || {};
        const detectedCity =
          address.city || address.town || address.village || "";
        const detectedState = address.state || "";
        const detectedPincode = address.postcode || "";

        if (!detectedPincode || detectedPincode.length !== 6) {
          toast.warn("Couldn't detect valid pincode from location.");
        }

        setFormData((prev) => ({
          ...prev,
          city: detectedCity,
          state: detectedState,
          pincode: detectedPincode,
        }));
      } catch (error) {
        toast.error("Failed to fetch location info.");
      }
    });
  };

  return (
    <div className="address-container">
      <ToastContainer />
      <h2>{isEditing ? "Edit Address" : "Add New Address"}</h2>
      <form className="address-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="Name*"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="10-digit Mobile Number*"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="pincode"
            placeholder="Pincode*"
            value={formData.pincode}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="locality"
            placeholder="Locality*"
            value={formData.locality}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full-width">
          <textarea
            name="address"
            placeholder="Address (Area and Street)*"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="city"
            placeholder="City/District/Town"
            value={formData.city}
            onChange={handleChange}
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <select
            name="addressType"
            value={formData.addressType}
            onChange={handleChange}
            className="address-type-select"
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button
          type="button"
          onClick={useMyLocation}
          className="use-location-btn"
        >
          Use My Location
        </button>

        <button type="submit" className="save-address-btn">
          {isEditing ? "Update Address" : "Save Address"}
        </button>
      </form>
    </div>
  );
};

export default Address;