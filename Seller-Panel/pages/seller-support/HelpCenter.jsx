import React from 'react';
import Layout from '../../src/components/Layouts/Layout';
import BackButton from '../../src/components/Common/BackButton/BackButton';
import './SellerSupportPage.css';

const HelpCenter = () => {
  return (
    <Layout>
      <div className="seller-support-page">
        <div className="support-header">
          <BackButton to="/home" />
          <h1>Seller Help Center</h1>
        </div>
        <div className="support-content">
          <h2>Welcome to the Aestheticommerce Seller Panel!</h2>
          <p>This guide will help you navigate the seller panel and manage your shop effectively.</p>

          <h2>1. Dashboard Overview</h2>
          <p>Your dashboard is the first page you see when you log in. It provides a quick snapshot of your shop's performance, including:</p>
          <ul>
            <li><strong>Total Sales:</strong> Your total revenue from all completed orders.</li>
            <li><strong>Recent Orders:</strong> A list of your most recent orders, with quick links to view details.</li>
            <li><strong>Top-Performing Products:</strong> A list of your best-selling products.</li>
          </ul>

          <h2>2. Managing Products</h2>
          <p>The "Products" section is where you manage your entire product catalog.</p>
          <ul>
            <li><strong>Adding a New Product:</strong> Click the "Add Product" button to create a new listing. You'll need to provide a title, description, price, and high-quality images.</li>
            <li><strong>Editing a Product:</strong> Click on any product in the list to edit its details.</li>
            <li><strong>Managing Inventory:</strong> Keep your stock levels up to date to avoid overselling.</li>
          </ul>

          <h2>3. Managing Orders</h2>
          <p>The "Orders" section helps you keep track of all your customer orders.</p>
          <ul>
            <li><strong>Viewing Orders:</strong> You can see all your orders, from new to completed.</li>
            <li><strong>Updating Order Status:</strong> Mark orders as "Shipped" or "Completed" to keep your customers informed.</li>
            <li><strong>Adding Tracking Information:</strong> Provide a tracking number for each order so customers can track their packages.</li>
          </ul>

          <h2>4. Viewing Statistics</h2>
          <p>The "Statistics" section provides valuable insights into your shop's performance.</p>
          <ul>
            <li><strong>Sales Over Time:</strong> Track your sales trends on a daily, weekly, or monthly basis.</li>
            <li><strong>Earnings:</strong> See a breakdown of your earnings, including our commission fees.</li>
            <li><strong>Customer Behavior:</strong> Understand how customers are interacting with your shop.</li>
          </ul>

          <h2>5. Customer Insights</h2>
          <p>The "Customers" section gives you an overview of your customer base. You can see a list of all your customers, their purchase history, and identify your most loyal buyers.</p>

          <h2>6. Settings</h2>
          <p>In the "Settings" section, you can manage your shop's information.</p>
          <ul>
            <li><strong>Shop Profile:</strong> Update your shop name, logo, and banner.</li>
            <li><strong>Payment Details:</strong> Manage your bank account information for payouts.</li>
            <li><strong>Shipping Settings:</strong> Configure your shipping rates and options.</li>
          </ul>

          <h2>Contact Us</h2>
          <p>If you need further assistance, please do not hesitate to contact us at <a href="mailto:info@aestheticommerce.com">info@aestheticommerce.com</a>.</p>
        </div>
      </div>
    </Layout>
  );
};

export default HelpCenter;