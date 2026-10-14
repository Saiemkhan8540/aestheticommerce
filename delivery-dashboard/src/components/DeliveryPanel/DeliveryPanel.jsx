// import React, { useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   Search,
//   Package,
//   MapPin,
//   Loader2,
//   X,
//   Navigation,
//   Radar,
// } from "lucide-react"; // Added Radar icon
// import { useDispatch, useSelector } from "react-redux";
// import DeliveryRequest from "../DeliveryRequest/DeliveryRequest";
// import {
//   fetchOrders,
//   setSearchTerm,
//   setActiveFilter,
// } from "../../Redux/ordersSlice";

// // Import both active and nearby Redux actions and components
// import {
//   getActiveTask,
//   getNearbyDeliveries,
// } from "../../Redux/deliveryTaskSlice";
// import ActiveDelivery from "../ActiveDelivery/ActiveDelivery";
// import NearbyDeliveries from "../NearbyDeliveries/NearbyDeliveries"; // Adjust path if needed

// import "./DeliveryPanel.css";
// import { useRiderSocket } from "../../hooks/useRiderSocket";

// const DeliveryPanel = () => {
//   const dispatch = useDispatch();

//   // Grab orders state
//   const {
//     filteredOrders,
//     orders,
//     searchTerm,
//     activeFilter,
//     loading: ordersLoading,
//   } = useSelector((state) => state.orders);

//   // Grab delivery tasks state for badges
//   const { activeTask, nearbyTasks } = useSelector(
//     (state) => state.deliveryTasks,
//   );

//   // Ensure arrays for length counts
//   const activeTasksArray = Array.isArray(activeTask)
//     ? activeTask
//     : activeTask
//       ? [activeTask]
//       : [];
//   const nearbyTasksArray = Array.isArray(nearbyTasks) ? nearbyTasks : [];

//   const riderId = localStorage.getItem("riderId");
//   const token = localStorage.getItem("deliveryToken");

//   useRiderSocket(riderId, token);

//   useEffect(() => {
//     dispatch(fetchOrders());
//     dispatch(getActiveTask());
//     dispatch(getNearbyDeliveries());

//     // Default tab: Nearby Radar
//     dispatch(setActiveFilter("Nearby Deliveries"));
//   }, [dispatch]);

//   // Optional: periodically refresh nearby deliveries while Nearby tab is active
//   useEffect(() => {
//     if (activeFilter !== "Nearby Deliveries") return;

//     const intervalId = setInterval(() => {
//       dispatch(getNearbyDeliveries());
//     }, 30000); // 30 seconds

//     return () => clearInterval(intervalId);
//   }, [activeFilter, dispatch]);

//   const getStatusCount = (status) => {
//     if (status === "All Orders") return orders.length;
//     return orders.filter((order) => order.status === status).length;
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Shipped":
//         return "#3b82f6";
//       case "Out for Delivery":
//         return "#f59e0b";
//       case "Delivered":
//         return "#10b981";
//       case "Cancelled":
//         return "#e74f4f";
//       default:
//         return "#6b7280";
//     }
//   };

//   if (ordersLoading) {
//     return (
//       <div className="loading-container">
//         <Loader2 size={48} className="spinner" />
//         <p className="loading-text">Loading Dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="container">
//         <div className="header">{/* Header content if any */}</div>

//         <div className="controls">
//           <div className="search-container">
//             <Search size={20} color="#6b7280" />
//             <input
//               type="text"
//               placeholder="Search by order ID, product, or address..."
//               className="search-input"
//               value={searchTerm}
//               onChange={(e) => dispatch(setSearchTerm(e.target.value))}
//             />
//             <input
//               type="text"
//               placeholder="order ID, product, or address..."
//               className="search-input-mob"
//               value={searchTerm}
//               onChange={(e) => dispatch(setSearchTerm(e.target.value))}
//             />
//             {searchTerm && (
//               <X
//                 size={20}
//                 color="#6b7280"
//                 className="clear-search"
//                 onClick={() => dispatch(setSearchTerm(""))}
//               />
//             )}
//           </div>

//           <div className="filters">
//             {/* ✅ NEARBY RADAR TAB BUTTON (BLUE) ✅ */}
//             <button
//               className={`filter-button ${activeFilter === "Nearby Deliveries" ? "active" : ""}`}
//               onClick={() => dispatch(setActiveFilter("Nearby Deliveries"))}
//             >
//               <Radar size={16} />
//               Nearby Radar
//               <span
//                 className="filter-count"
//                 style={{ backgroundColor: "white", color: "#3b82f6" }}
//               >
//                 {nearbyTasksArray.length}
//               </span>
//             </button>

//             {/* ✅ ACTIVE DELIVERY TAB BUTTON (GREEN) ✅ */}
//             <button
//               className={`filter-button ${activeFilter === "Active Deliveries" ? "active" : ""}`}
//               onClick={() => dispatch(setActiveFilter("Active Deliveries"))}
//             >
//               <Navigation size={16} />
//               Active Deliveries
//               <span
//                 className="filter-count"
//                 style={{ backgroundColor: "white", color: "#10b981" }}
//               >
//                 {activeTasksArray.length}
//               </span>
//             </button>

//             {/* EXISTING FILTERS */}
//             {[
//               "Dispatched",
//               "Shipped",
//               "Out for Delivery",
//               "Delivered",
//               "Cancelled",
//               "All Orders",
//             ].map((filter) => (
//               <button
//                 key={filter}
//                 className={`filter-button ${activeFilter === filter ? "active" : ""}`}
//                 onClick={() => dispatch(setActiveFilter(filter))}
//               >
//                 {filter}
//                 <span className="filter-count">{getStatusCount(filter)}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         <DeliveryRequest />

//         {/* ✅ CONDITIONAL RENDERING SYSTEM ✅ */}
//         {activeFilter === "Active Deliveries" ? (
//           <div style={{ marginTop: "20px" }}>
//             <ActiveDelivery />
//           </div>
//         ) : activeFilter === "Nearby Deliveries" ? (
//           <div style={{ marginTop: "20px" }}>
//             <NearbyDeliveries />
//           </div>
//         ) : (
//           <>
//             <div className="grid">
//               {filteredOrders.map((order, index) => {
//                 const addressStr =
//                   typeof order.address === "object"
//                     ? `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.pincode}`
//                     : order.address || "";
//                 console.log("order:- ", order);

//                 return (
//                   <Link
//                     key={`${order.orderId}-${order.itemId}`}
//                     to={`/order/${order.orderId}/${order.itemId}`}
//                     className="card"
//                     style={{
//                       animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
//                       textDecoration: "none",
//                       color: "inherit",
//                     }}
//                   >
//                     <div className="card-image">
//                       <img
//                         src={
//                           order.productImage ||
//                           "https://via.placeholder.com/400"
//                         }
//                         alt={order.productTitle}
//                         loading="lazy"
//                         className="image"
//                       />
//                       <span
//                         className="status-badge"
//                         style={{
//                           backgroundColor: getStatusColor(order.status),
//                         }}
//                       >
//                         {order.status}
//                       </span>
//                     </div>

//                     <div className="card-content">
//                       <span className="order-id-text">{order.orderId}</span>
//                       <h3 className="card-title">{order.productTitle}</h3>

//                       <div className="card-address">
//                         <MapPin size={16} color="#6b7280" />
//                         <p className="address-text">{addressStr}</p>
//                       </div>
//                     </div>
//                   </Link>
//                 );
//               })}
//             </div>

//             {filteredOrders.length === 0 && (
//               <div className="empty-state">
//                 <Package size={64} color="#d1d5db" />
//                 <h3 className="empty-title">No orders found</h3>
//                 <p className="empty-text">
//                   Try adjusting your search or filters
//                 </p>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </>
//   );
// };

// export default DeliveryPanel;


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Package, MapPin, Loader2, X, Navigation, Radar, History
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import DeliveryRequest from "../DeliveryRequest/DeliveryRequest";
import { fetchOrders, setSearchTerm, setActiveFilter } from "../../Redux/ordersSlice";
import { getActiveTask, getNearbyDeliveries } from "../../Redux/deliveryTaskSlice";
import ActiveDelivery from "../ActiveDelivery/ActiveDelivery";
import NearbyDeliveries from "../NearbyDeliveries/NearbyDeliveries";
import { useRiderSocket } from "../../hooks/useRiderSocket";
import "./DeliveryPanel.css";

const DeliveryPanel = () => {
  const dispatch = useDispatch();

  // Local state to manage the 3 main views
  const [mainTab, setMainTab] = useState("Nearby Radar"); 

  const {
    filteredOrders, orders, searchTerm, activeFilter, loading: ordersLoading,
  } = useSelector((state) => state.orders);

  const { activeTask, nearbyTasks } = useSelector((state) => state.deliveryTasks);

  const activeTasksArray = Array.isArray(activeTask) ? activeTask : activeTask ? [activeTask] : [];
  const nearbyTasksArray = Array.isArray(nearbyTasks) ? nearbyTasks : [];

  const riderId = localStorage.getItem("riderId");
  const token = localStorage.getItem("deliveryToken");

  useRiderSocket(riderId, token);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(getActiveTask());
    dispatch(getNearbyDeliveries());
  }, [dispatch]);

  useEffect(() => {
    if (mainTab !== "Nearby Radar") return;
    const intervalId = setInterval(() => {
      dispatch(getNearbyDeliveries());
    }, 30000);
    return () => clearInterval(intervalId);
  }, [mainTab, dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "#10b981";
      case "Cancelled": return "#e74f4f";
      case "Failed": return "#dc2626";
      default: return "#6b7280";
    }
  };

  if (ordersLoading) {
    return (
      <div className="loading-container">
        <Loader2 size={48} className="spinner" />
        <p className="loading-text">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="controls">
        <div className="search-container">
          <Search size={20} color="#6b7280" />
          <input
            type="text"
            placeholder="Search orders..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          />
          {searchTerm && (
            <X size={20} color="#6b7280" className="clear-search" onClick={() => dispatch(setSearchTerm(""))} />
          )}
        </div>

        {/* MAIN NAVIGATION TABS */}
        <div className="filters" style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "10px" }}>
          <button
            className={`filter-button ${mainTab === "Nearby Radar" ? "active" : ""}`}
            onClick={() => setMainTab("Nearby Radar")}
          >
            <Radar size={16} /> Nearby Radar
            <span className="filter-count" style={{ backgroundColor: "white", color: "#3b82f6" }}>
              {nearbyTasksArray.length}
            </span>
          </button>

          <button
            className={`filter-button ${mainTab === "Active Deliveries" ? "active" : ""}`}
            onClick={() => setMainTab("Active Deliveries")}
          >
            <Navigation size={16} /> Active Deliveries
            <span className="filter-count" style={{ backgroundColor: "white", color: "#10b981" }}>
              {activeTasksArray.length}
            </span>
          </button>

          <button
            className={`filter-button ${mainTab === "History" ? "active" : ""}`}
            onClick={() => setMainTab("History")}
          >
            <History size={16} /> Delivery History
          </button>
        </div>
      </div>

      <DeliveryRequest />

      {/* RENDER THE SELECTED VIEW */}
      {mainTab === "Active Deliveries" ? (
        <div style={{ marginTop: "15px" }}><ActiveDelivery /></div>
      ) : mainTab === "Nearby Radar" ? (
        <div style={{ marginTop: "20px" }}><NearbyDeliveries /></div>
      ) : (
        /* HISTORY TAB CONTENT */
        <div style={{ marginTop: "20px" }}>
          
          {/* Sub-filters strictly for history */}
          <div className="filters" style={{ marginBottom: "20px", justifyContent: "flex-start" }}>
            {["All History", "Delivered", "Cancelled"].map((filter) => (
              <button
                key={filter}
                className={`filter-button ${activeFilter === filter ? "active" : ""}`}
                style={{ fontSize: "12px", padding: "6px 12px" }}
                onClick={() => dispatch(setActiveFilter(filter))}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid">
            {filteredOrders.map((order, index) => {
              const addressStr = typeof order.address === "object"
                ? `${order.address.street}, ${order.address.city}, ${order.address.pincode}`
                : order.address || "";

              return (
                <Link
                  key={`${order.orderId}-${order.itemId}`}
                  to={`/order/${order.orderId}/${order.itemId}`}
                  className="card"
                  style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`, textDecoration: "none", color: "inherit" }}
                >
                  <div className="card-image">
                    <img
                      src={order.productImage || "https://via.placeholder.com/400"}
                      alt={order.productTitle}
                      className="image"
                    />
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                      {order.status}
                    </span>
                  </div>
                  <div className="card-content">
                    <span className="order-id-text">{order.orderId}</span>
                    <h3 className="card-title">{order.productTitle}</h3>
                    <div className="card-address">
                      <MapPin size={16} color="#6b7280" />
                      <p className="address-text">{addressStr}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredOrders.length === 0 && (
            <div className="empty-state">
              <Package size={64} color="#d1d5db" />
              <h3 className="empty-title">No history found</h3>
              <p className="empty-text">You haven't completed any deliveries yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryPanel;