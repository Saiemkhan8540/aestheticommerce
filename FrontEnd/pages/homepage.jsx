import React, { useEffect } from 'react';
import Navbar from '../src/components/Navbar/Navbar.jsx';
import Herosection from '../src/components/Herosection/Herosection.jsx';
import Scrollsection from '../src/components/Scrollsection/Scrollsection.jsx';
import Shopsection from '../src/components/Shopsection/shopsection.jsx';
import BestSellers from '../src/components/BestSeller/Bestseller.jsx';
import Footersec from '../src/components/Footersection/Footersection.jsx';
import Newsletter from '../src/components/NewsletterSection/Newsletter.jsx';
import Coustomer from '../src/components/Coustomerreview/Coustomer.jsx';
import SaleSection from '../src/components/Salesection/salesection.jsx';
import Blogsection from '../src/components/Blogsection/Blogsection.jsx';
import SearchBar from '../src/components/SearchBar/searchbar.jsx';


import SEO from '../src/utils/SEO.jsx';
function Homepage() {
    return (
      <div>
        <SEO
             title="Buy Aesthetic Paintings, Calligraphy & Crafts Online | Aestheticommerce"
            description= "Shop aesthetic handmade art & crafts at Aestheticommerce – paintings, calligraphy, origami, Indian folk art, sand arts & beadwork. Perfect and aesthetic gifts & décor."
             keywords= "aesthetic art online,  aesthetic crafts, aesthetic paintings, aesthetic calligraphy,aesthetic origami decor, Indian folk art, sand art online, beadwork crafts, unique art gifts"
            url={`${import.meta.env.VITE_APP_URL}`}
   />
            
            <Navbar></Navbar>
            <SearchBar></SearchBar> 
            <Herosection></Herosection>
            <Scrollsection></Scrollsection>
             <Shopsection></Shopsection>
            <BestSellers></BestSellers>
            <SaleSection></SaleSection>
            <Coustomer></Coustomer>
            <Blogsection></Blogsection>
            <Newsletter></Newsletter>
            <Footersec></Footersec>
     </div>
    
        
    );
}

export default Homepage;