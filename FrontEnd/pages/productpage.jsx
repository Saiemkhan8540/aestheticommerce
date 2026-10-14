import Navbar from "../src/components/Navbar/Navbar.jsx";
import Shop from "../src/components/Product/Testing/ShopM/Product/ShopM.jsx";
import Footersec from "../src/components/Footersection/Footersection.jsx";

import { Provider } from "react-redux";
import { useParams } from "react-router-dom";
import SEO from "../src/utils/SEO.jsx";

// import { store } from "../src/Store/store.js";
const formatText=(text)=>{
  if(!text)return "";
    return text.replace(/-/g," ")
         .replace(/\b\w/g,char=>char.toUpperCase());
}

function Productpage() {
  const baseUrl = import.meta.env.VITE_APP_URL || "https://aestheticommerce.com";

     const {category , subcategory}=useParams();
  
   const formatCategory=formatText(category);
   const formatSubcategory=formatText(subcategory);

    const pageTitle= subcategory?`Buy ${formatSubcategory} Online | ${formatCategory}| Aestheticommerce`:category
    ? `Buy ${formatCategory} Online| Aestheticommerce`
        : `All Products | Aestheticommerce`;

    const pageDescription= subcategory?
    `Shop premium ${formatSubcategory} under ${formatCategory}. Handmade aesthetic art available online.`
    :category?`Explore beautiful ${formatCategory} collection at Aestheticommerce.`
    :`Explore all aesthetic handmade art & crafts online.`;

    const pageUrl=subcategory?
    `${baseUrl}/${category}/${subcategory}`:
    category?
    `${baseUrl}/${category}`
    :`${baseUrl}/products`;
    
  return (
    // <Provider store={store}>
    //   <Shop />
    // </Provider>
   <>
   <SEO
     title={pageTitle}
     description={pageDescription}
        url={pageUrl}
   />
    <Navbar/>
    <Shop />
    <Footersec/>
    </>
  );
}

export default Productpage;