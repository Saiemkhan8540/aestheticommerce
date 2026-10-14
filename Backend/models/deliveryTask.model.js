const mongoose = require("mongoose");
const deliveryTaskSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        // unique: true,
        index: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true,
        index: true
    },
    items: [
        {
            itemId: {
                type: String,
                required: true
            },

            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },

            name : {
                type: String,
            } ,

            quantity: Number,
            price: Number,

            status: {
                type: String,
                enum: [
                    "Pending",
                    "PickedUp",
                    "OutForDelivery",
                    "Delivered",
                    "Cancelled"
                ],
                default: "Pending"
            }
        }
    ],

    deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryPartner",
        default: null
    },
    pickupContact: {
        name: String,
        phone: String,
    },
    dropContact: {
        name: String,
        phone: String,
        alternatePhone: String,
    },

    pickupAddress: {
    fullName: String,
    // phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
   },

   dropAddress : {
    fullName: String,
    // phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
   },
    pickupLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: true
        },
        // address: String, // use pickupaddress instead
    },

    dropLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        },
        // address: String // use dropaddress instead
    },
    
    liveLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
      },
      updatedAt: Date,
    },

    status: {
        type: String,
        enum: ["Pending", "Assigned", "Accepted", "PickedUp", "OutForDelivery", "Delivered",
            "Failed", "Cancelled"],
        default: "Pending",
        index: true,
    },

    attempts: [
        {
            deliveryPartner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "DeliveryPartner",
            },
            status: {
                type: String,
                enum: ["Assigned", "Accepted", "Cancelled", "Failed"],
            },
            assignedBy: {
                type: String,
                enum: ["System","Seller","Partner"]
            },
            reason: String,
            at: {
                type: Date,
                default: Date.now,
            },
        },
    ],

    otp: {
        code: String,
        isVerified: { type: Boolean, default: false },
        verifiedAt: Date,
    },
    deliveryFee: {
        type: Number,
        default: 0
    },

    cancelledBy: {
        type: String,
        enum: ["user", "delivery_partner", "admin", "system", "seller"],
    },

    cancelReason: String,

    deliveryRating: {
        score: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: Date
    }

}, {
    timestamps: true
})

deliveryTaskSchema.index({ pickupLocation: "2dsphere" });
deliveryTaskSchema.index({ dropLocation: "2dsphere" });

deliveryTaskSchema.index({ status: 1, deliveryPartner: 1 });

module.exports = mongoose.model("DeliveryTask", deliveryTaskSchema);