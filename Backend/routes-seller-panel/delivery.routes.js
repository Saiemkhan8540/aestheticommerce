const express = require("express");
const { protectSeller } = require("../MiddlewareSellerPanel/sellerPanelauthMidWar");
const { getActiveDeliveries, markAsPickedUp } = require("../controllersSellerPanel/sellerDeliveryController");
const router = express.Router();

router.get("/active-deliveries",protectSeller,getActiveDeliveries);
router.put("/markAsPickedUp",protectSeller,markAsPickedUp);

module.exports = router;