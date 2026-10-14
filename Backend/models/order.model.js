const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    index: true,
  },

  // Customer who placed the order
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Each product in the order (order item level)
  products: [
    {
      itemId: { type: String, index: true }, // Unique per item
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName : {
        type : String 
      },
      // ✅ Match Product schema
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
      sellerName: { type: String, required: true },
      storeName: { type: String, required: true },

      quantity: { type: Number, required: true, min: 1 },
      // Customer-facing (offered) price at order time; value is always offeredPrice (same as product API)
      price: { type: Number, required: true },

      // Status per item
      status: {
        type: String,
        enum: ['Pending', 'Dispatched', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending',
      },


      // Tracking info per seller item
      trackingInfo: {
        courier: String,
        trackingNumber: String,
        updatedAt: { type: Date, default: Date.now },
      },

      // Cancellation details
      cancelReason: {
        type: String,
        default: '',
      },
      cancelledBy: {
        type: String,
        enum: ['user', 'delivery_partner', null],
        default: null,
      }

    },
  ],

  // --- NEW FIELDS FOR PRODUCTION PAYMENT FLOW ---
  paymentMethode: {
    type: String,
    enum: ["Online","COD"],
    required: true
  },
  razorpayOrderId:{
    type: String,
  },
  razorpayPaymentId:{
    type: String,
  },
  expireAt: { type: Date }, // MongoDB TTL Timer

  // Total for the entire order
  totalAmount: {
    type: Number,
    required: true,
  },
  //new entries for payment details
 pricingBreakdown:{
      subtotal:{type:Number,default:0},
      gstPercent:{type:Number,default:5},
      gstAmount:{type:Number,default:0},
      shippingCharge:{type:Number,default:0},
      deliveryCharge: { type: Number, default: 0 },
       //discount fields added
       discountCode:{type:String,default:null},
       discountType:{type:String,enum:["flat","percent"],default:null},
       discountValue:{type:Number,default:0},
       discountAmount:{type:Number,default:0} //it is different for diff people 

 },
  // Payment info
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending',
  },

  // Overall delivery status for customer view (derived from items)
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Dispatched', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },

  // Shipping address
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
  },

  cancelledAt: {
    type: Date,
    default: null,
  },

  // Order-level review (optional)
  rating: {
    stars: { type: Number, min: 1, max: 5 },
    text: String,
    photos: [{ type: String }],
    submittedAt: { type: Date, default: Date.now },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// Helpers to generate IDs
function generateBaseNumericId() {
  const timestampPart = Date.now().toString(); // 13 digits
  const randomPart = String(Math.floor(10000 + Math.random() * 90000)); // 5 digits
  return `${timestampPart}${randomPart}`; // 18 digits
}

function generateOrderIdAndBase() {
  const base = generateBaseNumericId();
  const orderId = `OD${base}`;
  return { orderId, base };
}

function generateItemIdFromBase(baseNumericId, index) {
  try {
    const baseBig = BigInt(baseNumericId);
    return String(baseBig + BigInt(index));
  } catch (_) {
    return `${baseNumericId}${index}`;
  }
}

// Pre-save hook
orderSchema.pre('save', async function (next) {
  try {
    let baseForItems = null;

    if (!this.orderId) {
      for (let i = 0; i < 5; i++) {
        const { orderId, base } = generateOrderIdAndBase();
        const exists = await this.constructor.findOne({ orderId }).lean();
        if (!exists) {
          this.orderId = orderId;
          baseForItems = base;
          break;
        }
      }
      if (!this.orderId) {
        const fallback = generateOrderIdAndBase();
        this.orderId = fallback.orderId;
        baseForItems = fallback.base;
      }
    }

    if (!baseForItems && typeof this.orderId === 'string' && this.orderId.startsWith('OD')) {
      baseForItems = this.orderId.slice(2);
    }

    if (Array.isArray(this.products)) {
      this.products = this.products.map((p, idx) => {
        if (!p.itemId) {
          const base = baseForItems || generateBaseNumericId();
          p.itemId = generateItemIdFromBase(base, idx);
        }
        return p;
      });
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Order', orderSchema);
