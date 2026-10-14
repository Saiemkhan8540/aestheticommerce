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

function formatEstimatedDelivery(processedAt, etaDate) {
  const eta = etaDate || getEstimatedDelivery(processedAt);

  if (isInDeliveryWindow(processedAt)) {
    return eta.toLocaleString("en-IN", {
      timeZone: IST,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return eta.toLocaleDateString("en-IN", {
    timeZone: IST,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatEstimatedDeliveryDate(processedAt, etaDate) {
  const eta = etaDate || getEstimatedDelivery(processedAt);

  return eta.toLocaleDateString("en-IN", {
    timeZone: IST,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDeliveryEstimatePreview(at = new Date()) {
  const express = isInDeliveryWindow(at);
  const etaFormatted = formatEstimatedDelivery(at);

  if (express) {
    return {
      isExpress: true,
      title: "2-Hour Express Delivery",
      message: `Order now and receive by ${etaFormatted}`,
      note: "Available for orders placed between 10 AM – 8 PM IST",
    };
  }

  return {
    isExpress: false,
    title: "Standard Delivery",
    message: `Estimated delivery by ${etaFormatted}`,
    note: "2-hour express delivery applies to orders placed between 10 AM – 8 PM IST",
  };
}

export {
  getEstimatedDelivery,
  formatEstimatedDelivery,
  formatEstimatedDeliveryDate,
  getDeliveryEstimatePreview,
  isInDeliveryWindow,
};
