import React from 'react';
import Navbar from '../src/components/Navbar/Navbar.jsx';
import ContactUs from '../src/components/ContactUs/Contactus.jsx'
import NewsLetter from '../src/components/NewsletterSection/Newsletter.jsx';
import Footer from '../src/components/Footersection/Footersection.jsx';
import SEO from '../src/utils/SEO.jsx';


function Contactpage() {
    
    return (
        <>
         <SEO
                title="Contact Us | Aestheticommerce"
                description="Have a question or need help? Contact Aestheticommerce team for support, queries about orders, products or collaborations."
                keywords="contact aestheticommerce, customer support, art shop help, order query"
                url={`${import.meta.env.VITE_APP_URL}/contact`}
            />
        <div>
            <Navbar noMarginBottom={true}></Navbar>
            <ContactUs></ContactUs>
            <Footer></Footer>
 
            
        </div>
        </>
    );
}

export default Contactpage;