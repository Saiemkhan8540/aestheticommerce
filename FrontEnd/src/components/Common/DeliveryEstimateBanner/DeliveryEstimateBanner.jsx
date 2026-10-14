import React from "react";
import { Truck, Clock } from "lucide-react";
import { getDeliveryEstimatePreview } from "../../../utils/deliveryEta";
import "./DeliveryEstimateBanner.css";

const DeliveryEstimateBanner = ({ className = "" }) => {
  const { isExpress, title, message, note } = getDeliveryEstimatePreview(
    new Date(),
  );
  const Icon = isExpress ? Truck : Clock;

  return (
    <div
      className={`delivery-estimate-banner ${isExpress ? "delivery-estimate-banner--express" : "delivery-estimate-banner--standard"} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="delivery-estimate-banner__icon">
        <Icon size={20} />
      </div>
      <div className="delivery-estimate-banner__content">
        <p className="delivery-estimate-banner__title">{title}</p>
        <p className="delivery-estimate-banner__message">{message}</p>
        <p className="delivery-estimate-banner__note">{note}</p>
      </div>
    </div>
  );
};

export default DeliveryEstimateBanner;
