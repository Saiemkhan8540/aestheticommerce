import React from 'react';
import Layout from '../../src/components/Layouts/Layout';
import BackButton from '../../src/components/Common/BackButton/BackButton';
import './SellerSupportPage.css';

const Faq = () => {
  return (
    <Layout>
      <div className="seller-support-page">
        <div className="support-header">
          <BackButton to="/home" />
          <h1>Frequently Asked Questions</h1>
        </div>
        <div className="support-content">
          <h2>Getting Started</h2>
          <p><strong>How do I start selling on Aestheticommerce?</strong></p>
          <p>To become a seller, you need to register for a seller account. Once your account is approved, you can begin listing your products and customizing your shop.</p>

          <h2>Products and Listings</h2>
          <p><strong>How do I add a new product?</strong></p>
          <p>You can add new products from the "Add Product" section in your seller dashboard. You will need to provide details such as the product title, description, price, and images.</p>

          <p><strong>What kind of products can I sell?</strong></p>
          <p>Aestheticommerce is a marketplace for handmade and unique goods. Please refer to our Seller Handbook for a detailed list of prohibited items.</p>

          <p><strong>How can I improve my product listings?</strong></p>
          <p>To make your listings more appealing, use high-quality photos, write detailed and accurate descriptions, and use relevant keywords to improve search visibility.</p>

          <h2>Orders and Shipping</h2>
          <p><strong>How will I know when I have a new order?</strong></p>
          <p>You will receive an email notification for every new order. You can also view all your orders in the "Orders" section of your seller dashboard.</p>

          <p><strong>Who is responsible for shipping?</strong></p>
          <p>Sellers are responsible for packing and shipping their own products. You must provide a tracking number for each shipment to ensure a secure transaction for both you and the buyer.</p>

          <p><strong>What should I do if a package is lost or damaged?</strong></p>
          <p>If a package is lost or damaged in transit, you should work with the buyer to resolve the issue. This may include filing a claim with the shipping carrier, providing a replacement, or issuing a refund.</p>

          <h2>Payments and Fees</h2>
          <p><strong>What are the fees for selling on Aestheticommerce?</strong></p>
          <p>We charge a small commission on the total sale amount. For detailed information on our fee structure, please refer to our Seller Handbook.</p>

          <p><strong>How and when do I get paid?</strong></p>
          <p>Payments are transferred to your linked bank account after an order is successfully delivered. You can track your earnings and payment status in the "Statistics" section of your dashboard.</p>

          <h2>Contact Us</h2>
          <p>If you have any other questions, please contact us at <a href="mailto:info@aestheticommerce.com">info@aestheticommerce.com</a>.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Faq;