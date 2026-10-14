// Round to nearest price ending in 9 (e.g. 742 → 739, 748 → 749).
function roundToPriceEndingIn9(price) {
  const p = Math.round(price);
  const base = Math.floor(p / 10) * 10;
  const low = base - 1;
  const high = base + 9;
  return p - low <= high - p ? low : high;
}

// Compute offeredPrice and return product for client (no sellingPrice, platformFee, logisticsFee, transactionFee).
function toClientProduct(doc) {
  if (!doc) return doc;
  const raw = doc.toObject ? doc.toObject() : { ...doc };
  const sellingPrice = Number(raw.sellingPrice) || 0;
  const platformFee = Number(raw.platformFee) || 0;
  const logisticsFee = Number(raw.logisticsFee) || 0;
  const transactionFee = Number(raw.transactionFee) || 0;
  const discountPercentage = Number(raw.discountPercentage) || 0;
  const sum = sellingPrice + platformFee + logisticsFee + transactionFee;
  const rawPrice = sum * (1 - discountPercentage / 100);
  const offeredPrice = roundToPriceEndingIn9(rawPrice);
  const { sellingPrice: _s, platformFee: _p, logisticsFee: _l, transactionFee: _t, ...rest } = raw;
  return { ...rest, offeredPrice };
}

module.exports = { roundToPriceEndingIn9, toClientProduct };
