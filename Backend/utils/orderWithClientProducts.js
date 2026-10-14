const { toClientProduct } = require('./productForClient');

/**
 * Given order(s) with products[].product populated, return order(s) with each
 * product replaced by toClientProduct(product). Accepts a single order or an array.
 */
function orderWithClientProducts(orderOrArray) {
  const transform = (order) => {
    const raw = order.toObject ? order.toObject() : { ...order };
    if (Array.isArray(raw.products)) {
      raw.products = raw.products.map((p) => ({
        ...p,
        product: p.product ? toClientProduct(p.product) : p.product,
      }));
    }
    return raw;
  };
  if (Array.isArray(orderOrArray)) return orderOrArray.map(transform);
  return transform(orderOrArray);
}

module.exports = { orderWithClientProducts };
