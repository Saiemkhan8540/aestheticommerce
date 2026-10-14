const Banner = require("../models/banner.model");
const uploadToS3 = require("../utils/s3Upload");

// Create a new banner
const createBanner = async (req, res) => {
  try {
    const { redirectUrl, isActive } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    const result = await uploadToS3(req.file.buffer, "Banners", {
      contentType: req.file.mimetype,
      originalName: req.file.originalname,
    });
    const imageUrl = result.secure_url;

    const bannerIsActive = isActive === "true" || isActive === true;

    if (bannerIsActive) {
      // Deactivate all others if this one is active
      await Banner.updateMany({}, { isActive: false });
    }

    const newBanner = await Banner.create({
      imageUrl,
      redirectUrl,
      isActive: bannerIsActive,
    });

    res.status(201).json({ success: true, banner: newBanner });
  } catch (error) {
    console.error("Create Banner Error:", error);
    res.status(500).json({ success: false, message: "Error creating banner", error: error.message });
  }
};

// Get all banners for admin
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching banners", error: error.message });
  }
};

// Toggle active status
const toggleBannerActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive) {
      // Deactivate all others
      await Banner.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({ success: true, banner: updatedBanner });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error toggling banner status", error: error.message });
  }
};

// Delete banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBanner = await Banner.findByIdAndDelete(id);

    if (!deletedBanner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting banner", error: error.message });
  }
};

// Update banner (URL and optional image)
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { redirectUrl } = req.body;
    
    const updateData = {};
    if (redirectUrl) updateData.redirectUrl = redirectUrl;

    if (req.file) {
      const result = await uploadToS3(req.file.buffer, "Banners", {
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
      });
      updateData.imageUrl = result.secure_url;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({ success: true, banner: updatedBanner });
  } catch (error) {
    console.error("Update Banner Error:", error);
    res.status(500).json({ success: false, message: "Error updating banner", error: error.message });
  }
};

// Public: Get active banner
const getActiveBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne({ isActive: true });
    res.status(200).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching active banner", error: error.message });
  }
};

module.exports = {
  createBanner,
  getAllBanners,
  toggleBannerActive,
  deleteBanner,
  updateBanner,
  getActiveBanner,
};
