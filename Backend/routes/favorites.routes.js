const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favorites.controller");
const {protect} = require("../Middleware/authMiddleware");

// ===== Favorites 
router.get('/favorites', protect, favoritesController.getFavorites);
router.post('/favorites', protect, favoritesController.addFavorite);
router.delete('/favorites/:productId', protect, favoritesController.removeFavorite);

module.exports = router;