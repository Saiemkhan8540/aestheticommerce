import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmationModal from "../../src/component/ConfirmationModal/ConfirmationModal";
import Pagination from "../../src/component/Pagination/Pagination";
import "./Riders.css";

const API = import.meta.env.VITE_API_URL;

const RidersPage = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [modalAction, setModalAction] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;


// fetch riders 
  const fetchRiders = async (type) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      const endpoint =
        type === "pending"
          ? "/api/admin/riders/pending"
          : "/api/admin/riders/active";

      const response = await axios.get(`${API}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRiders(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch riders");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRiders(activeTab);
    setCurrentPage(1);
  }, [activeTab]);

 
// activate/deactivate
  const handleActionClick = (rider, action) => {
    setSelectedRider(rider);
    setModalAction(action);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      await axios.patch(
        `${API}/api/admin/riders/${selectedRider._id}/status`,
        { isActive: modalAction === "activate" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(
        `Rider ${
          modalAction === "activate" ? "activated" : "deactivated"
        } successfully`
      );

      setRiders((prev) =>
        prev.filter((r) => r._id !== selectedRider._id)
      );
    } catch (error) {
      toast.error("Action failed");
    }

    setModalOpen(false);
    setSelectedRider(null);
    setModalAction(null);
  };
  // search
  const filteredRiders = riders.filter((rider) => {
    const term = searchTerm.toLowerCase();
    return (
      rider.name.toLowerCase().includes(term) ||
      rider.email.toLowerCase().includes(term) ||
      rider.phone.includes(term) ||
      (rider.currentCity &&
        rider.currentCity.toLowerCase().includes(term))
    );
  });
  
  // pagination
  const totalPages = Math.ceil(filteredRiders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRiders = filteredRiders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (loading) return <div className="riders-loading">Loading...</div>;

  return (
    <>
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmAction}
        title={`Confirm ${modalAction}`}
      >
        <p>
          Are you sure you want to {modalAction} this rider?
        </p>
      </ConfirmationModal>

      <div className="riders-page">
        <div className="riders-header">
          <h1>Rider Management</h1>
          <p>Approve and manage delivery partners</p>
        </div>

        <div className="riders-controls">
          <div className="riders-tabs">
            <button
              className={`tab-btn ${
                activeTab === "pending" ? "active" : ""
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </button>

            <button
              className={`tab-btn ${
                activeTab === "active" ? "active" : ""
              }`}
              onClick={() => setActiveTab("active")}
            >
              Active
            </button>
          </div>

          <input
            type="text"
            placeholder="Search riders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="riders-search"
          />
        </div>

        <div className="riders-content">
          {paginatedRiders.length === 0 ? (
            <div className="no-riders">
              No riders to display.
            </div>
          ) : (
            <>
              <div className="riders-grid">
                {paginatedRiders.map((rider) => (
                  <div key={rider._id} className="rider-card">
                    <div className="rider-info">
                      <h3>{rider.name}</h3>
                      <p><strong>Email:</strong> {rider.email}</p>
                      <p><strong>Phone:</strong> {rider.phone}</p>
                      <p>
                        <strong>City:</strong>{" "}
                        {rider.currentCity || "N/A"}
                      </p>
                    </div>

                    <div className="rider-actions">
                      {activeTab === "pending" && (
                        <button
                          className="btn-approve"
                          onClick={() =>
                            handleActionClick(rider, "activate")
                          }
                        >
                          Approve
                        </button>
                      )}

                      {activeTab === "active" && (
                        <button
                          className="btn-deactivate"
                          onClick={() =>
                            handleActionClick(rider, "deactivate")
                          }
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredRiders.length}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default RidersPage;