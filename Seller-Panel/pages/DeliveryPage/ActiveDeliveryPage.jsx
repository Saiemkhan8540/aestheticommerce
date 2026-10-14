import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from '../../src/components/Layouts/Layout';
import styles from "./Delivery.module.css";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_URL;

const ActiveDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loadingTask, setLoadingTask] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [cooldowns, setCooldowns] = useState({});
  useEffect(() => {
    fetchDeliveries();
  }, []);

  const filteredDeliveries = deliveries.filter((task) => {
    const orderId = task.order?.orderId?.toLowerCase() || "";

    const matchesSearch =
      searchTerm === "" ||
      orderId.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "" ||
      task.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

 const sendDeliveryRequest = async (taskId) => {
  if (loadingTask || cooldowns[taskId]) return;

  try {
    setLoadingTask(taskId);

    const token = localStorage.getItem("sellerToken");

    await axios.post(
      `${BASE_URL}/api/deliveryTask/sendRequest/${taskId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    toast.success("Delivery request sent to nearby riders");

    // Start 20 second cooldown
    setCooldowns((prev) => ({
      ...prev,
      [taskId]: 20,
    }));

    const interval = setInterval(() => {
      setCooldowns((prev) => {
        const newTime = (prev[taskId] || 0) - 1;

        if (newTime <= 0) {
          clearInterval(interval);
          const updated = { ...prev };
          delete updated[taskId];
          return updated;
        }

        return {
          ...prev,
          [taskId]: newTime,
        };
      });
    }, 1000);

    fetchDeliveries();
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to send request");
  } finally {
    setLoadingTask(null);
  }
};

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem("sellerToken");

      const res = await axios.get(
        `${BASE_URL}/api/seller/delivery/active-deliveries`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDeliveries(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch deliveries");
    }
  };

  const markPickedUp = async (taskId) => {
    if (loadingTask) return;
    try {
      setLoadingTask(taskId);
      const token = localStorage.getItem("sellerToken");

      await axios.put(
        `${BASE_URL}/api/seller/delivery/markAsPickedUp`,
        { taskId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Marked as PickedUp");
      fetchDeliveries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoadingTask(null);
    }
  };

  const overview = {
    total: filteredDeliveries.length,
    assigned: filteredDeliveries.filter(d => d.status?.toLowerCase() === "assigned").length,
    pickedUp: filteredDeliveries.filter(d => d.status?.toLowerCase() === "pickedup").length,
    delivered: filteredDeliveries.filter(d => d.status?.toLowerCase() === "delivered").length,
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.heading}>Active Deliveries</h1>
        <div className={styles.overviewGrid}>
          <div className={styles.overviewCard}>
            <h4>Total</h4>
            <span>{overview.total}</span>
          </div>
          <div className={styles.overviewCard}>
            <h4>Assigned</h4>
            <span>{overview.assigned}</span>
          </div>
          <div className={styles.overviewCard}>
            <h4>Picked Up</h4>
            <span>{overview.pickedUp}</span>
          </div>
          <div className={styles.overviewCard}>
            <h4>Delivered</h4>
            <span>{overview.delivered}</span>
          </div>
        </div>

        <div className={styles.filterBar}>
          <input
            type="text"
            placeholder="Search Order ID (e.g. 283)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.statusSelect}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="PickedUp">PickedUp</option>
            <option value="OutForDelivery">OutForDelivery</option>
            <option value="Delivered">Delivered</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
            }}
            className={styles.clearBtn}
          >
            Clear
          </button>
        </div>
        {filteredDeliveries.length === 0 ? (
          <div className={styles.empty}>
            <h3>
              {statusFilter
                ? `No ${statusFilter} Deliveries Found`
                : "No Active Deliveries"}
            </h3>
            <p>
              {searchTerm || statusFilter
                ? "Try adjusting your filters."
                : "Once you dispatch items, they will appear here."}
            </p>
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {filteredDeliveries.map((task) => (
              <div key={task._id} className={styles.card}>
                {/* Header */}
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.orderId}>
                      Order #{task.order?.orderId}
                    </h3>
                    <span
                      className={`${styles.status} ${styles[task.status?.toLowerCase()]
                        }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                {/* Rider Section */}
                <div className={styles.section}>
                  <strong>Assigned Rider</strong>
                  <p>
                    {task.deliveryPartner
                      ? `${task.deliveryPartner.name} • ${task.deliveryPartner.phone}`
                      : "Not Assigned Yet"}
                  </p>
                </div>

                {/* Items Section */}
                <div className={styles.section}>
                  <strong>Items</strong>

                  {(expandedTask === task._id
                    ? task.items
                    : task.items?.slice(0, 3)
                  )?.map((item) => (
                    <div key={item.itemId} className={styles.itemRow}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemQty}>×{item.quantity}</span>
                    </div>
                  ))}

                  {task.items?.length > 3 && (
                    <button
                      className={styles.showMoreBtn}
                      onClick={() =>
                        setExpandedTask(expandedTask === task._id ? null : task._id)
                      }
                    >
                      {expandedTask === task._id
                        ? "Show Less"
                        : `+${task.items.length - 3} more items`}
                    </button>
                  )}
                </div>

                {/* Address Section */}
                <div className={styles.addressSection}>
                  <div>
                    <strong>Pickup</strong>
                    <p>{task.pickupAddress?.street}</p>
                    <small>
                      {task.pickupAddress?.city},{" "}
                      {task.pickupAddress?.state}
                    </small>
                  </div>

                  <div className={styles.arrow}>→</div>

                  <div>
                    <strong>Drop</strong>
                    <p>{task.dropAddress?.street}</p>
                    <small>
                      {task.dropAddress?.city},{" "}
                      {task.dropAddress?.state}
                    </small>
                  </div>
                </div>

                {/* Action */}
                {task.status === "Pending" && (
                  <button
                    onClick={() => sendDeliveryRequest(task._id)}
                    className={styles.secondaryBtn}
                    disabled={loadingTask === task._id || cooldowns[task._id]}
                  >
                    {loadingTask === task._id
                      ? "Sending..."
                      : cooldowns[task._id]
                        ? `Retry in ${cooldowns[task._id]}s`
                        : "Send Delivery Request"}
                  </button>
                )}
                {task.status === "Assigned" && (
                  <button
                    onClick={() => markPickedUp(task._id)}
                    className={styles.primaryBtn}
                    disabled={loadingTask === task._id}
                  >
                    {loadingTask === task._id ? "Updating..." : "Mark as Picked Up"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ActiveDeliveries;