import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useDispatch } from "react-redux";

import store from "./Store/store";
import { loadCurrentSeller } from "./Redux/authSlice";

import Mainpage from "../pages/Mainpage";
import Layout from "./components/Layouts/Layout";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/Loginpage/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import AddProductPage from "../pages/AddProductPage";
import SellerProfilePage from "../pages/ProfilePage";
import StatisticsPage from "../pages/Stats";
import Order from "../pages/OrdersPage";
import Inventory from "../pages/Inventory";
import CustomerInsightsSec from "../pages/CustomerInsights";
import Settings from "../pages/Settings";
import ProductDetailPage from "../pages/ProductViewpage/ProductDetailPage";
import ScrollToTop from "./components/ScrollToTop";
import ProductsPage from "../pages/ProductPage/ProductPage";
import HelpCenter from "../pages/seller-support/HelpCenter";
import ShippingPolicy from "../pages/seller-support/ShippingPolicy";
import Faq from "../pages/seller-support/Faq";
import TermsOfService from "../pages/seller-support/TermsOfService";
import PrivacyPolicy from "../pages/seller-support/PrivacyPolicy";
import RefundPolicy from "../pages/seller-support/RefundPolicy";
import ContactPage from "../pages/ContactPage";

import MyProducts from "../pages/MyProducts/MyProducts";
import MySubmissionsPage from "../pages/MySubmissionsPage/MySubmissionsPage";

import OnboardingStep from "./components/Register/Onboarding";

// import UpdateDetails  from '../pages/ProductUpdate/updateDetails/updateDetails';
// import UpdatePrices from '../pages/ProductUpdate/updatePrices/updatePrices';
import UpdateDetails from "../pages/ProductUpdate/updateDetails/UpdateDetails";
import UpdatePrices from "../pages/ProductUpdate/updatePrices/UpdatePrices";
import VerificationOtpPage from "../pages/VerificationOtpPage";
import PasswordChangeOrContinuePage from "../pages/PasswordChangeOrContinuePage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import ActiveDeliveries from "../pages/DeliveryPage/ActiveDeliveryPage";

// Bootstraps auth state from backend using stored token
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadCurrentSeller());
  }, [dispatch]);

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop />

        <AuthInitializer>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/delivery" element={<ActiveDeliveries />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verification-otp" element={<VerificationOtpPage />} />
            <Route
              path="/password-change-continue"
              element={<PasswordChangeOrContinuePage />}
            />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            
            {/* Dashboard Routes wrapped in Layout */}
            <Route element={<Layout />}>
              <Route path="/home" element={<Mainpage />} />
              <Route path="/addProduct" element={<AddProductPage />} />
              <Route path="/seller/profile" element={<SellerProfilePage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/orders" element={<Order />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/customers" element={<CustomerInsightsSec />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/onboarding" element={<OnboardingStep />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/dashboard/product/:id"
                element={<ProductDetailPage />}
              />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/my-products" element={<MyProducts />} />
              <Route path="/my-submissions" element={<MySubmissionsPage />} />
              <Route
                path="/products/:id/update-details"
                element={<UpdateDetails />}
              />
              <Route
                path="/products/:id/update-prices"
                element={<UpdatePrices />}
              />
              {/* Seller Support Pages */}
              <Route
                path="/seller-support/help-center"
                element={<HelpCenter />}
              />
              <Route
                path="/seller-support/shipping-policy"
                element={<ShippingPolicy />}
              />
              <Route path="/seller-support/faq" element={<Faq />} />
              <Route
                path="/seller-support/terms-of-service"
                element={<TermsOfService />}
              />
              <Route
                path="/seller-support/privacy-policy"
                element={<PrivacyPolicy />}
              />
              <Route
                path="/seller-support/refund-policy"
                element={<RefundPolicy />}
              />
            </Route>
          </Routes>
        </AuthInitializer>
      </Router>
    </Provider>
  );
}

export default App;
