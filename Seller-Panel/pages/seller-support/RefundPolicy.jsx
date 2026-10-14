import React from 'react';
import Layout from '../../src/components/Layouts/Layout';
import BackButton from '../../src/components/Common/BackButton/BackButton';
import './SellerSupportPage.css';

const RefundPolicy = () => {
  return (
    <Layout>
      <div className="seller-support-page">
        <div className="support-header">
          <BackButton to="/home" />
          <h1>Refund, Return & Dispute Resolution Policy</h1>
        </div>
        <div className="support-content">
          <h2>1. Applicability</h2>
          <p>Applies to all sales between Buyers and Creators on the platform.</p>
          <h2>2. Seller Listings</h2>
          <p>Sellers must specify return/exchange rules for each product.</p>
          <h2>3. Eligible Returns</h2>
          <p>Accepted if product is unused, undamaged, and within the stated period.</p>
          <h2>4. Non-Eligible Returns</h2>
          <p>Personalized, digital, or perishable items cannot be returned.</p>
          <h2>5. Process</h2>
          <p>Buyers contact Sellers via platform chat; Sellers respond within 72 hours.</p>
          <h2>6. Refunds</h2>
          <p>Issued after verification, to the same payment method. Typically within 14 days.</p>
          <h2>7. Disputes</h2>
          <p>If unresolved, escalate to Aestheticommerce Support. Platform may hold payouts during resolution.</p>
          <h2>8. Cancellation</h2>
          <p>Allowed before shipment; full refund if accepted.</p>
          <h2>9. Lost/Damaged Shipments</h2>
          <p>Buyer must report with photos; Seller responsible if in transit.</p>
          <h2>10. International Sales</h2>
          <p>Customs/duties borne by buyer unless otherwise stated.</p>
          <h2>11. Communication</h2>
          <p>All disputes must be documented via platform messaging.</p>
          <h2>12. Amendments</h2>
          <p>Policy may change periodically; updates reflected on website. Governing Law: India (New Delhi jurisdiction).</p>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPolicy;