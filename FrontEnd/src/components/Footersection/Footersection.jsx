import React from 'react';
import './Footersection.css';
import { FaInstagram, FaLinkedin, FaFacebook, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from '../../Images/Asset9.png';
import {motion} from "framer-motion";

function Footersec() {
  return (
    <footer className="footer bg-footer">
      <div className="footer-container">

        <motion.div className="footer-section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="footer-logo">
            <Link to="/" onClick={() => window.scrollTo(0, 0)}>
              <img src={logo} alt="Aestheticommerce Logo" className="footer-logo-img" />
            </Link>
          </div>
          <p className="footer-desc">Where Handmade, meets Heartmade.</p>
        </motion.div>

          <motion.div className="footer-section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
          <h3>Customer Support</h3>
          <ul>
            <li><Link to="/contact">Help Center</Link></li>
            <li><Link to="/ship">Shipping & Returns</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
            <li><Link className='track' to="/OrderList">Track Order</Link></li>
            <li><Link to="/privacy-policy">Policies</Link></li>
          </ul>
        </motion.div>

        <motion.div className="footer-section section-bg" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/products">Product</Link></li>
            <li><Link to="/shops">Shops</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </motion.div>

        <motion.div className="footer-section section-bg" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
          <h3>Office</h3>
          <p>Aestheticommerce HQ, Delhi, India.</p>
          <h3>Mail</h3>
           
            <a href="mailto:info@aestheticommerce.com" className="footer-mail">
              support@aestheticommerce.com
            </a>
             
          

        </motion.div>


      </div>

      <motion.div className="footer-section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
  
      <div className="footer-social-bottom">
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className="footer-logo-mobile">
          <img src={logo} alt="Aestheticommerce Logo" className="footer-logo-img-mob-social" />
        </Link>
      <h3>FOLLOW US</h3>
      <div className="social-icons">
        <a href="https://www.instagram.com/aestheticommerce" target="_blank" rel="noopener noreferrer">
          <FaInstagram />
        </a>
        <a href="https://www.linkedin.com/company/aestheticommerce/" target="_blank" rel="noopener noreferrer">
          <FaLinkedin />
        </a>
        <a href="https://www.facebook.com/aestheticommerce" target="_blank" rel="noopener noreferrer">
          <FaFacebook />
        </a>
        <a href="https://www.twitter.com/aestheticommerce" target="_blank" rel="noopener noreferrer">
          <FaTwitter />
        </a>
      </div>

  </div>
  </motion.div>

      <div className="footer-bottom">
        © 2026 Aestheticommerce. All rights reserved. | HandmadeWithLove by Team Aestheticommerce.
      </div>



    </footer>
  );
}

export default Footersec;