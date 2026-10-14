const IST = "Asia/Kolkata";

function getHourInIST(date) {
  return Number(
    new Date(date).toLocaleString("en-IN", {
      timeZone: IST,
      hour: "numeric",
      hour12: false,
    }),
  );
}

function isInDeliveryWindow(processedAt) {
  const hour = getHourInIST(processedAt);
  return hour >= 10 && hour < 20;
}

function getEstimatedDelivery(processedAt) {
  const base = new Date(processedAt);

  if (isInDeliveryWindow(processedAt)) {
    return new Date(base.getTime() + 2 * 60 * 60 * 1000);
  }

  const eta = new Date(base);
  eta.setDate(eta.getDate() + 7);
  return eta;
}

module.exports = {
  getEstimatedDelivery,
  isInDeliveryWindow,
};
