import React from 'react';
import './Footer.css';
import { FaInstagram, FaLinkedin, FaFacebook, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../../Images/Asset9.png';

function Footersec({ collapsed }) {
  return (
    <footer className={`footer bg-footer${collapsed ? ' collapsed' : ''}`}>
      <div className="footer-container">
        <motion.div className="footer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
          <div className="footer-logo">
            <Link to="/home" onClick={() => window.scrollTo(0, 0)}>
              <img src={logo} alt="Aestheticommerce Logo" className="footer-logo-img" />
            </Link>
          </div>
          <p className="footer-desc">Where Handmade, meets Heartmade.</p>
        </motion.div>

        <motion.div className="footer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}>
          <h3>Seller Support</h3>
          <ul>
            <li><Link to="/seller-support/help-center">Help Center</Link></li>
            <li><Link to="/seller-support/shipping-policy">Shipping Policy</Link></li>
            <li><Link to="/seller-support/faq">FAQs</Link></li>
            <li><Link to="/seller-support/terms-of-service">Terms of Service</Link></li>
            <li><Link to="/seller-support/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/seller-support/refund-policy">Refund Policy</Link></li>
          </ul>
        </motion.div>

        <motion.div className="footer-section section-bg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/statistics">Statistics</Link></li>
            <li><Link to="/customers">Customers</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </motion.div>

        <motion.div className="footer-section section-bg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}>
          <h3>Office</h3>
          <p className="footer-address">Aestheticommerce HQ, Delhi, India.</p>
          <h3>Mail</h3>
          <p>
            <a href="mailto:info@aestheticommerce.com" className="footer-mail">
              info@aestheticommerce.com
            </a>
          </p>
        </motion.div>
      </div>

      <motion.div className="footer-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}>
        <div className="footer-social-bottom">
          <h3>FOLLOW US</h3>
          <div className="social-icons">
            <a href="https://www.instagram.com/aestheticommerce" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://www.linkedin.com/company/aestheticommerce/" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            <a href="https://www.facebook.com/aestheticommerce" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://www.twitter.com/aestheticommerce" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          </div>
        </div>
      </motion.div>

      <div className="footer-bottom">
        © 2025 Aestheticommerce. All rights reserved. | HandmadeWithLove by Team Aestheticommerce.
      </div>
    </footer>
  );
}

export default Footersec;