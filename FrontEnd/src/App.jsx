import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "./ui/toaster/toaster";
import { Toaster as SonnerToaster } from "sonner";

import Homepage from "../pages/homepage";
import Productpage from "../pages/productpage";
import OrdersPage from "../pages/ordersPage";
import Loginpage from "../pages/Loginpage";
import Registerpage from "../pages/Registerpage";
import Contactpage from "../pages/contactpage";
import Blog from "../pages/blogpage";
import Profile from "../pages/profilepage";
import Cartpage from "../pages/cartpage";
import ShopPage from "../pages/shoppage";
import ProductDetails from "./components/Product/Testing/ProductDetails/ProductDetails.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import SellerHandler from "../src/components/SellerPages/Handler.jsx";
import BlogDetails from "./components/Blog/BlogDetails/BlogDetails.jsx";
import ShopDetails from "./components/ShopDetails/ShopDetails.jsx";
import Order from "./components/Order/Checkout/Checkout.jsx";
import OrderPlaced from "./components/Order/OrderPlaced/OrderPlaced.jsx";
import OrderList from "./components/Order/OrderList/OrderList.jsx";
import OrderDetails from "./components/Order/OrderDetails/OrderDetails.jsx";
import AddressList from "./components/Address/AddressList/AddressList.jsx";
import FavoritesPage from "./components/Favorites/FavoritesPage.jsx";
import { useCartPersistence } from "./hooks/useCartPersistence";
//import privacy policy
import PrivacyPolicy from "../pages/PrivacyPolicy.jsx";
import TermsOfUse from "../pages/TermsPage.jsx";
import SellerPolicy from "../pages/SellerPolicyPage.jsx";
import BuyerPolicy from "../pages/BuyerPolicy.jsx";
import PrivacyAddendum from "../pages/PrivacyPolicyAddendum.jsx";
import RefundPolicy from "../pages/RefundPolicy.jsx";
import ForgotPasswordpage from "../pages/ForgotPasswordpage.jsx";
import VerificationOtpPage from "../pages/VerificationOtpPage.jsx";
import PasswordChangeOrContinuePage from "../pages/PasswordChangeOrContinuePage.jsx";
import ChangepasswordPage from "../pages/changepasswordPage.jsx";

import About from "../pages/aboutpage.jsx";
import BlogDetailsPage from "../pages/BlogDetailsPage.jsx";
import AddressListPage from "../pages/AddressListPage.jsx";
function App() {
  useCartPersistence();

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/products" element={<Productpage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/register" element={<Registerpage />} />
        <Route path="/forgot-password" element={<ForgotPasswordpage />} />
        <Route path="/verification-otp" element={<VerificationOtpPage />} />
        <Route path="/password-change-continue" element={<PasswordChangeOrContinuePage />} />
        <Route path="/change-password" element={<ChangepasswordPage />} />
        <Route path="/contact" element={<Contactpage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cartpage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/seller" element={<SellerHandler />} />
        <Route path="/sale" element={<Productpage />} />
        <Route path="/shops" element={<ShopPage />} />
        <Route path="/shop-products" element={<ShopDetails />} />

        {/* Order Routes */}
        <Route path="/order-checkout" element={<Order />} />
        {/* <Route path="/OrderList" element={<OrderList />} /> */}
        <Route path="/OrderList" element={<OrdersPage />} />
        <Route path="/order_Details" element={<OrderDetails />} />
        <Route path="/order_details" element={<OrderDetails />} />
        <Route path="/order-placed/:orderNumber" element={<OrderPlaced />} />

        {/* Address Routes */}
        {/* <Route path="/AddressList" element={<AddressList />} /> */}
        <Route path="/AddressList" element={<AddressListPage />} />

        {/* Blog Routes */}
        {/* <Route path="/blogs/:id" element={<BlogDetails />} /> */}
        <Route path="/blogs/:id" element={<BlogDetailsPage />} />

        {/*Privacy-Policy Routes*/}
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-of-use" element={<TermsOfUse />} />
        <Route path="seller-policy" element={<SellerPolicy />} />
        <Route path="buyer-policy" element={<BuyerPolicy />} />
        <Route path="privacy-policy-addendum" element={<PrivacyAddendum />} />
        <Route path="refund-policy" element={<RefundPolicy/>}/>
        <Route path="/about" element={<About />} />
        
 
        {/* Product Routes */}
        <Route path="/:category" element={<Productpage />} />
        <Route path="/:category/:subcategory" element={<Productpage />} />
        <Route
          path="/:category/:subcategory/:productName/:productId" //---
          element={<ProductDetails />}
        />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Toaster />
      <SonnerToaster />
    </Router>
  );
}

export default App;
