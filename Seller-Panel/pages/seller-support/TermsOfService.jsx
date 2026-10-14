import React from 'react';
import Layout from '../../src/components/Layouts/Layout';
import BackButton from '../../src/components/Common/BackButton/BackButton';
import './SellerSupportPage.css';

const TermsOfService = () => {
  return (
    <Layout>
      <div className="seller-support-page">
        <div className="support-header">
          <BackButton to="/home" />
          <h1>Terms of Service</h1>
        </div>
        <div className="support-content">
          <p>Aestheticommerce (“we,” “our,” “us”) operates an online art and handmade product marketplace where artists and collectors engage globally. By using our platform (www.aestheticommerce.com), you agree to these terms.</p>
          <h2>1. Eligibility</h2>
          <p>You must be 18+ or under guardian supervision.</p>
          <h2>2. Account Responsibility</h2>
          <p>Users must maintain accuracy and confidentiality.</p>
          <h2>3. Seller Obligations</h2>
          <p>Sellers must list original handmade works and comply with laws.</p>
          <h2>4. Buyer Responsibilities</h2>
          <p>Buyers must read descriptions, comply with rules, and not misuse reviews.</p>
          <h2>5. Payments</h2>
          <p>Processed securely via third-party gateways. Fees are disclosed before transactions.</p>
          <h2>6. Intellectual Property</h2>
          <p>All platform content belongs to Aestheticommerce or licensors.</p>
          <h2>7. Limitation of Liability</h2>
          <p>We act as intermediaries and are not liable for damages or transaction disputes.</p>
          <h2>8. Termination</h2>
          <p>We may suspend or terminate accounts for violations.</p>
          <h2>9. Governing Law</h2>
          <p>Governed by Indian law, jurisdiction New Delhi.</p>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;