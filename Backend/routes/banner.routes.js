const express = require("express");
const router = express.Router();
const { getActiveBanner } = require("../controllersAdminPanel/banner.controller");

router.get("/active", getActiveBanner);

module.exports = router;
