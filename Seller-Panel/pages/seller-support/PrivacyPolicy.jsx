import React from 'react';
import Layout from '../../src/components/Layouts/Layout';
import BackButton from '../../src/components/Common/BackButton/BackButton';
import './SellerSupportPage.css';

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="seller-support-page">
        <div className="support-header">
          <BackButton to="/home" />
          <h1>Privacy Policy</h1>
        </div>
        <div className="support-content">
          <p>We value your privacy and commit to protecting your data.</p>
          <h2>1. Data Collection</h2>
          <p>Includes name, contact, address, payment info, device data, and usage stats.</p>
          <h2>2. Use of Data</h2>
          <p>To provide services, process payments, and communicate updates.</p>
          <h2>3. Cookies</h2>
          <p>We use cookies to personalize user experience.</p>
          <h2>4. Sharing</h2>
          <p>Shared only with payment, logistics partners, or authorities as required.</p>
          <h2>5. Security</h2>
          <p>Data protected via encryption and secure storage.</p>
          <h2>6. Rights</h2>
          <p>Users may access, modify, or delete their data anytime.</p>
          <h2>7. Retention</h2>
          <p>Data retained only as necessary or by law.</p>
          <h2>8. Updates</h2>
          <p>Policy updates will be communicated via our website. Contact: privacy@aestheticommerce.com</p>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;