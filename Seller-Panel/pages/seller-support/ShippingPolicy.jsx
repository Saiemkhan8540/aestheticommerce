import React from 'react';
import Layout from '../../src/components/Layouts/Layout';
import BackButton from '../../src/components/Common/BackButton/BackButton';
import './SellerSupportPage.css';

const ShippingPolicy = () => {
  return (
    <Layout>
      <div className="seller-support-page">
        <div className="support-header">
          <BackButton to="/home" />
          <h1>Shipping Policy</h1>
        </div>
        <div className="support-content">
          <p><strong>Last Updated: October 21, 2025</strong></p>

          <h2>1. Order Processing Time</h2>
          <p>Sellers are expected to process and ship orders within the timeframe specified in their product listings. We recommend a processing time of 1-3 business days to ensure a positive customer experience.</p>

          <h2>2. Shipping Methods and Costs</h2>
          <p>Sellers have the flexibility to choose their preferred shipping carriers and set their own shipping rates. We encourage offering a range of shipping options, including standard and expedited services, to accommodate different customer needs. All shipping costs must be clearly communicated in the product listing.</p>

          <h2>3. International Shipping</h2>
          <p>For sellers offering international shipping, it is your responsibility to be aware of and comply with all customs, duties, and import regulations for the destination country. Buyers are responsible for any additional customs fees or taxes. Aestheticommerce is not responsible for any delays caused by customs processes.</p>

          <h2>4. Shipment Tracking</h2>
          <p>To protect both buyers and sellers, a tracking number must be provided for every order. This allows customers to monitor their shipment's progress and provides a record of delivery.</p>

          <h2>5. Damaged or Lost Items</h2>
          <p>In the unfortunate event that an item is lost or damaged during transit, the seller is responsible for resolving the issue with the buyer. This may involve filing a claim with the shipping carrier, sending a replacement item, or issuing a full refund.</p>

          <h2>6. Contact Us</h2>
          <p>If you have any questions about our shipping policy, please contact us at <a href="mailto:info@aestheticommerce.com">info@aestheticommerce.com</a>.</p>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingPolicy;