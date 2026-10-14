const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const Seller = require('../models/seller.model');
const { toClientProduct } = require('./productForClient');

const PRODUCT_SELECT_FOR_OFFERED_PRICE =
  'name sellingPrice sellerId sellerName storeName platformFee logisticsFee transactionFee discountPercentage';

/**
 * Normalize seller display fields so Order schema required sellerName/storeName never receive undefined
 * (matches order.routes ensureSellerMeta behavior).
 */
function normalizedSellerMetaFromRow(sellerRow) {
  if (!sellerRow) {
    return { sellerName: 'Unknown Seller', storeName: 'Marketplace' };
  }
  return {
    sellerName: sellerRow.sellerName || 'Unknown Seller',
    storeName: sellerRow.storeName || 'Marketplace',
  };
}

/**
 * Build validated line items for Razorpay / payment routes from cart or body.products / orderData.products.
 */
async function buildPaymentOrderItems(req) {
  const sourceProducts = req.body.orderData?.products || req.body.products;
  let rawItems = [];
  let isFromCart = false;

  if (Array.isArray(sourceProducts) && sourceProducts.length > 0) {
    rawItems = sourceProducts;
  } else {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items || cart.items.length === 0) return null;
    rawItems = cart.items;
    isFromCart = true;
  }

  const productIds = [
    ...new Set(
      rawItems.map(
        (item) => item.product?.toString() || item.product || item.productId,
      ),
    ),
  ];

  const products = await Product.find({ _id: { $in: productIds } })
    .select(PRODUCT_SELECT_FOR_OFFERED_PRICE)
    .lean();

  const productMap = {};
  const sellerIds = new Set();

  products.forEach((p) => {
    productMap[p._id.toString()] = p;
    if (p.sellerId) sellerIds.add(p.sellerId.toString());
  });

  if (isFromCart) {
    rawItems.forEach((item) => {
      if (item.sellerId) sellerIds.add(item.sellerId.toString());
    });
  }

  const sellers = await Seller.find({ _id: { $in: Array.from(sellerIds) } })
    .select('sellerName storeName')
    .lean();
  const sellerMap = {};
  sellers.forEach((s) => {
    sellerMap[s._id.toString()] = s;
  });

  const finalItems = [];
  for (const raw of rawItems) {
    const prodId = raw.product?.toString() || raw.product || raw.productId;
    const prod = productMap[prodId];
    if (!prod) continue;

    const clientProduct = toClientProduct(prod);
    const sellerId = prod.sellerId?.toString() || raw.sellerId?.toString();
    const sellerMeta = normalizedSellerMetaFromRow(
      sellerId ? sellerMap[sellerId] : null,
    );

    finalItems.push({
      product: prod._id,
      productName: prod.name,
      sellerId,
      sellerName: prod.sellerName || sellerMeta.sellerName,
      storeName: prod.storeName || sellerMeta.storeName,
      quantity: raw.quantity || 1,
      price: clientProduct.offeredPrice,
    });
  }
  return finalItems;
}

module.exports = {
  buildPaymentOrderItems,
  PRODUCT_SELECT_FOR_OFFERED_PRICE,
};
