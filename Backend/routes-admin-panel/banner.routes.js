const express = require("express");
const router = express.Router();
const multer = require("multer");
const { 
  createBanner, 
  getAllBanners, 
  toggleBannerActive, 
  deleteBanner,
  updateBanner
} = require("../controllersAdminPanel/banner.controller");
const { protectAdmin } = require("../MiddlewareAdminPanel/Adminauth.middleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// All these routes are protected by protectAdmin
router.use(protectAdmin);

router.post("/", upload.single("image"), createBanner);
router.get("/", getAllBanners);
router.patch("/:id/toggle", toggleBannerActive);
router.put("/:id", upload.single("image"), updateBanner);
router.delete("/:id", deleteBanner);

module.exports = router;
