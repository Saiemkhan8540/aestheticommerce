const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const deliveryPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  phone: {
    type: String,
    required: true,
  },
  //for admin
  isActive: {
    type: Boolean,
    default: true,
  },
  // online/offline
  isAvailable:{
    type: Boolean ,
    default : false 
  },
  
  currentLocation: {
  type: {
    type: String,
    enum: ["Point"],
  },
  coordinates: {
    type: [Number], // [lng, lat]
  },
  updatedAt: Date,
  },

  documents: {
    aadhar: {
      number: { type: String, select: false },
      verified: { type: Boolean, default: false },
      imageUrl: String,
    },
    drivingLicense: {
      number: { type: String, select: false },
      verified: { type: Boolean, default: false },
      imageUrl: String,
    },
    vehiclePapers: {
      number: { type: String, select: false },
      verified: { type: Boolean, default: false },
      imageUrl: String,
    },
  },

  bankDetails: {
    accountNumber: { type: String, select: false },
    ifscCode: { type: String, select: false },
    accountHolderName: String,
    bankName: String,
  },

  currentCity: {
    type: String,
    index: true,
  },

  stats: {
    totalDeliveries: { type: Number, default: 0 },
    cancelledDeliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password before saving
deliveryPartnerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
deliveryPartnerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

deliveryPartnerSchema.index({ currentLocation : "2dsphere"});

deliveryPartnerSchema.index({
  currentCity: 1,
  isActive: 1,
  isAvailable: 1,
});

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
