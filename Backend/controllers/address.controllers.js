const Address = require('../models/address.model');
const { validationResult } = require('express-validator');

// Get all addresses for a user
const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses'
    });
  }
};

// Create a new address
const createAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, phone, address, locality, city, state, pincode, addressType } = req.body;

    // If this is the first address, make it default
    const existingAddresses = await Address.find({ userId: req.user._id });
    const isDefault = existingAddresses.length === 0;

    const newAddress = new Address({
      userId: req.user._id,
      name,
      phone,
      address,
      locality,
      city,
      state,
      pincode,
      addressType: addressType || 'home',
      isDefault
    });

    const savedAddress = await newAddress.save();

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: savedAddress
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create address'
    });
  }
};

// Update an existing address
const updateAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { addressId } = req.params;
    const { name, phone, address, locality, city, state, pincode, addressType } = req.body;

    // Check if address belongs to user
    const existingAddress = await Address.findOne({
      _id: addressId,
      userId: req.user._id
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        name,
        phone,
        address,
        locality,
        city,
        state,
        pincode,
        addressType: addressType || existingAddress.addressType
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: updatedAddress
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address'
    });
  }
};

// Delete an address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    // Check if address belongs to user
    const address = await Address.findOne({
      _id: addressId,
      userId: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If deleting default address, make another address default
    if (address.isDefault) {
      const otherAddresses = await Address.find({
        userId: req.user._id,
        _id: { $ne: addressId }
      }).sort({ createdAt: -1 });

      if (otherAddresses.length > 0) {
        await Address.findByIdAndUpdate(otherAddresses[0]._id, { isDefault: true });
      }
    }

    await Address.findByIdAndDelete(addressId);

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address'
    });
  }
};

// Set address as default
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    // Check if address belongs to user
    const address = await Address.findOne({
      _id: addressId,
      userId: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Remove default from all other addresses
    await Address.updateMany(
      { userId: req.user._id },
      { isDefault: false }
    );

    // Set this address as default
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      { isDefault: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      data: updatedAddress
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address'
    });
  }
};

// Get a specific address
const getAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await Address.findOne({
      _id: addressId,
      userId: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch address'
    });
  }
};

module.exports = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAddressById
};