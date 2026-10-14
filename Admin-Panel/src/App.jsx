import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "../pages/LoginPage/LoginPage";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import SellersPage from "../pages/SellerPage/SellerPage";
import SellerProductsPage from "../pages/SellerProductsPage/SellerProductsPage";
import ProductsPage from "../pages/ProductPage/ProductPage";
import ReportsPage from "../pages/ReportsPage/ReportsPage";
import AnalyticsPage from "../pages/AnalyticsPage/AnalyticsPage";
import GlobalSearchPage from "../pages/GlobalSearchPage/GlobalSearchPage";
import ContactMessagesPage from "../pages/ContactMessagesPage/ContactMessagesPage";
import SellerDetailsPage from "../pages/SellerDetailsPage/SellerDetailsPage";
import OrdersPage from "../pages/OrdersPage/OrdersPage";
import OrderDetailsPage from "../pages/OrderDetailsPage/OrderDetailsPage";
import RidersPage from "../pages/RidersPage/Riders";
import BannerPage from "../pages/BannerPage/BannerPage";
import AdminLayout from "../src/layouts/AdminLayout";
import { Toaster } from "react-hot-toast";

const App = () => {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL;
    const verifyAdmin = async () => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        try {
          const response = await fetch(`${apiBase}/api/admin/verify`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            setIsAdmin(true);
          } else if (response.status === 401) {
            localStorage.removeItem("adminToken");
          }
        } catch {
          // Network or other errors: do not clear token so temporary outages don't force logout
        }
      }
      setLoading(false);
    };

    verifyAdmin();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={
            isAdmin ? (
              <Navigate to="/" />
            ) : (
              <LoginPage setIsAdmin={setIsAdmin} />
            )
          }
        />

        {/* All Admin Routes Wrapped inside AdminLayout */}
        <Route
          path="/"
          element={
            isAdmin ? (
              <AdminLayout onLogout={() => setIsAdmin(false)}>
                <DashboardPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/sellers"
          element={
            isAdmin ? (
              <AdminLayout onLogout={() => setIsAdmin(false)}>
                <SellersPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/sellers/:sellerId/products"
          element={
            isAdmin ? (
              <AdminLayout onLogout={() => setIsAdmin(false)}>
                <SellerProductsPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/products"
          element={
            isAdmin ? (
              <AdminLayout onLogout={() => setIsAdmin(false)}>
                <ProductsPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/reports"
          element={
            isAdmin ? (
              <AdminLayout onLogout={() => setIsAdmin(false)}>
                <ReportsPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/analytics"
          element={
            isAdmin ? (
              <AdminLayout onLogout={() => setIsAdmin(false)}>
                <AnalyticsPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/search"
          element={
            isAdmin ? (
              <AdminLayout onLogout={() => setIsAdmin(false)}>
                <GlobalSearchPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/seller/:sellerId"
          element={
            isAdmin ? (
              <AdminLayout onLogout={() => setIsAdmin(false)}>
                <SellerDetailsPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/contact-messages"
          element={
            isAdmin ? (
              <AdminLayout onLogout={() => setIsAdmin(false)}>
                <ContactMessagesPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/orders"
          element={
            isAdmin ? (
              <AdminLayout onLogout={() => setIsAdmin(false)}>
                <OrdersPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            isAdmin ? (
              <AdminLayout onLogout={() => setIsAdmin(false)}>
                <OrderDetailsPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/riders"
          element={
            isAdmin ? (
              <AdminLayout>
                <RidersPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/banners"
          element={
            isAdmin ? (
              <AdminLayout onLogout={() => setIsAdmin(false)}>
                <BannerPage />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
