const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../Middleware/authMiddleware');
const {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAddressById
} = require('../controllers/address.controllers');

// Validation middleware
const addressValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  body('address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('locality')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Locality must be between 2 and 100 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('pincode')
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('Pincode must be 6 digits'),
  body('addressType')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other')
];

// All routes require authentication
router.use(protect);

// GET /api/addresses - Get all addresses for the authenticated user
router.get('/', getUserAddresses);

// GET /api/addresses/:addressId - Get a specific address
router.get('/:addressId', getAddressById);

// POST /api/addresses - Create a new address
router.post('/', addressValidation, createAddress);

// PUT /api/addresses/:addressId - Update an existing address
router.put('/:addressId', addressValidation, updateAddress);

// DELETE /api/addresses/:addressId - Delete an address
router.delete('/:addressId', deleteAddress);

// PATCH /api/addresses/:addressId/default - Set address as default
router.patch('/:addressId/default', setDefaultAddress);

module.exports = router;