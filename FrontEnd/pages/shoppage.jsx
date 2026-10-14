import React from 'react';
import ShopComp from '../src/components/ShopCom/ShopCom';
import Navbar from '../src/components/Navbar/Navbar';
import SEO from '../src/utils/SEO.jsx';



const ShopPage = () => {
  return (
    <>
    <SEO
     title="Shop All Stores | Aestheticommerce"
     description="Discover unique handmade art stores on Aestheticommerce.Browse through curated shops selling aesthetic paintings, calligraphy,crafts and more — all in one place."
    keywords="handmade art shops, aesthetic stores online, buy from artists, craft shops india"  
     url={`${import.meta.env.VITE_APP_URL}/shops`}
    />
    <div>
        <Navbar />
        <ShopComp />
    </div>
    </>
  );
};

export default ShopPage;
