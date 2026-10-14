const express = require("express");
const router = express.Router();
const shipAddController = require("../controllers/shipAddress.controller");
// const {protect} = require("../Middleware/authMiddleware");

// Save user's address 
router.post('/save-address', shipAddController.saveUserAddress);

// Get saved address
router.post('/get-address', shipAddController.getUserAddress);

module.exports = router;