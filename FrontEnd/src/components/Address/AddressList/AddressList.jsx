import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddressList.css';
import Address from '../AddressUI/Address';

import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  clearError,
  clearSuccess
} from '../../../Redux/addressSlice';

const AddressList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { addresses, loading, error, success, message } = useSelector((state) => state.addresses);
  const { user, token } = useSelector((state) => state.user);

  // Local state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    if (!user || !token) {
      toast.error('Please login to manage your addresses');
      navigate('/login');
      return;
    }
    
    // Fetch addresses when component mounts
    dispatch(fetchAddresses());
  }, [dispatch, user, token, navigate]);

  // Handle success and error messages
  useEffect(() => {
    if (success && message) {
      toast.success(message);
      dispatch(clearSuccess());
      // Close form after successful submission
      if (showAddressForm) {
        setShowAddressForm(false);
        setEditingAddress(null);
      }
    }
  }, [success, message, dispatch, showAddressForm]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSetDefault = async (id) => {
    try {
      await dispatch(setDefaultAddress(id)).unwrap();
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteAddress(id)).unwrap();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const handleEdit = (address) => {
    // Parse the address back to form format
    const formData = {
      name: address.name,
      phone: address.phone,
      address: address.address,
      locality: address.locality,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      addressType: address.addressType || 'home'
    };
    setEditingAddress({ id: address._id, formData });
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (addressData) => {
    try {
      if (editingAddress) {
        // Update existing address
        await dispatch(updateAddress({
          addressId: editingAddress.id,
          addressData
        })).unwrap();
      } else {
        // Create new address
        await dispatch(createAddress(addressData)).unwrap();
      }
      
      // Don't close form here - let the success effect handle it
    } catch (error) {
      console.error('Failed to save address:', error);
      // Don't close form on error - let user fix and retry
    }
  };

  const handleBackToList = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null); // Clear any editing state
    setShowAddressForm(true);
  };

  // Show loading spinner
  if (loading && addresses.length === 0) {
    return (
      <div className="address-list-container">
        <div className="address-list-wrapper">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your addresses...</p>
          </div>
        </div>
      </div>
    );
  }

  // If address form is shown, render the Address component
  if (showAddressForm) {
    return (
      <div className="address-form-overlay">
        <div className="address-form-container">
          <div className="address-form-header">
            <button 
              onClick={handleBackToList}
              className="back-to-list-btn"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Address List
            </button>
          </div>
          <Address 
            onAddressSubmit={handleAddressSubmit} 
            initialData={editingAddress?.formData}
            isEditing={!!editingAddress}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="address-list-container">
      <div className="address-list-wrapper">
        {/* Debug Test Component */}
        {/* <AddressTest /> */}
        
        {/* Header */}
        <div className="header">
          <h1 className="title">My Addresses</h1>
          <button 
            className="add-button"
            onClick={handleAddNewAddress}
            disabled={loading}
          >
            <i className="fas fa-plus"></i>
            Add New Address
          </button>
        </div>

        {/* Address List */}
        <div className="address-list">
          {addresses.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-map-marker-alt empty-icon"></i>
              <h3>No addresses found</h3>
              <p>Add your first address to get started</p>
              <button 
                className="add-first-address-btn"
                onClick={handleAddNewAddress}
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            addresses.map((address) => (
              <div key={address._id} className="address-card">
                {/* Name and Default Badge */}
                <div className="address-header">
                  <h3 className="address-name">{address.name}</h3>
                  <div className="address-badges">
                    {address.isDefault && (
                      <span className="default-badge">
                        Default
                      </span>
                    )}
                    <span className="address-type-badge">
                      {address.addressType || 'home'}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <p className="address-text">
                  {address.address}, {address.locality}, {address.city}, {address.state} {address.pincode}
                </p>

                {/* Phone */}
                <p className="address-phone">
                  <i className="fas fa-phone"></i>
                  {address.phone}
                </p>

                {/* Action Buttons */}
                <div className="address-actions">
                  <button
                    onClick={() => handleEdit(address)}
                    className="action-btn edit-btn"
                    disabled={loading}
                  >
                    <i className="fas fa-edit"></i>
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(address._id)}
                    className="action-btn delete-btn"
                    disabled={loading}
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address._id)}
                      className="action-btn default-btn"
                      disabled={loading}
                    >
                      <i className="fas fa-star"></i>
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Delete Address</h3>
              <p className="modal-message">
                Are you sure you want to delete this address? This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="modal-btn cancel-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="modal-btn confirm-btn"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Container */}
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
          {/* Toast notifications will appear here */}
        </div>
      </div>
    </div>
  );
};

export default AddressList;