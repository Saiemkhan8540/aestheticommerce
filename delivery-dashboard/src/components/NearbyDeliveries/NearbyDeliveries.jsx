import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { getNearbyDeliveries, updateDriverLocation, acceptTask } from '../../Redux/deliveryTaskSlice';
import './NearbyDeliveries.css';

const NearbyDeliveries = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getNearbyDeliveries());
  }, [dispatch]);
  
  const { nearbyTasks, loading, locationError, actionLoading } = useSelector((state) => state.deliveryTasks);
  
  console.log("getNearbyDeliveries:- ", nearbyTasks);

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info("Finding your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        dispatch(updateDriverLocation({ lat: latitude, lng: longitude }))
          .unwrap()
          .then(() => toast.success("Location updated! Finding deliveries..."))
          .catch((err) => toast.error(err));
      },
      (error) => {
        toast.error("Please allow location permissions to find deliveries.");
      }
    );
  };

  const handleAccept = async (taskId) => {
    try {
      await dispatch(acceptTask(taskId)).unwrap();
      toast.success("Task Accepted!");
      dispatch(getNearbyDeliveries());
    } catch (err) {
      toast.error(err || "Failed to accept task");
    }
  };

  if (loading && (!nearbyTasks || nearbyTasks.length === 0)) {
    return (
      <div className="nearby-container loader-center">
        <div className="delivery-spinner"></div>
        <p>Scanning for nearby orders...</p>
      </div>
    );
  }

  // Handle the specific "Update Location First" backend error
  if (locationError) {
    return (
      <div className="nearby-container empty-state">
        <div className="empty-icon">📍</div>
        <h2>Location Required</h2>
        <p>We need your current location to show you the closest delivery tasks.</p>
        <button className="location-btn" onClick={handleUpdateLocation} disabled={actionLoading}>
          {actionLoading ? 'Updating...' : 'Share My Location'}
        </button>
      </div>
    );
  }

  if (!nearbyTasks || nearbyTasks.length === 0) {
    return (
      <div className="nearby-container empty-state">
        <div className="empty-icon">😴</div>
        <h2>No Deliveries Nearby</h2>
        <p>There are no pending orders within a 5km radius right now.</p>
        <button className="refresh-btn" onClick={() => dispatch(getNearbyDeliveries())}>
          Refresh Radar
        </button>
      </div>
    );
  }

  return (
    <div className="nearby-container">
      <div className="nearby-header">
        <h2>Delivery Radar</h2>
        <button className="refresh-icon-btn" onClick={() => dispatch(getNearbyDeliveries())}>
          🔄
        </button>
      </div>
      <p className="subtitle">Found {nearbyTasks.length} orders near you</p>

      <div className="nearby-grid">
        {nearbyTasks.map((task) => (
          <div key={task._id} className="nearby-card">
            <div className="card-top">
              {/* Convert meters to kilometers for display */}
              <div className="distance-badge">
                📍 {(task.distance / 1000).toFixed(1)} km away
              </div>
              <div className="fee-badge">₹{task.deliveryFee || 40}</div>
            </div>

            <div className="route-preview">
              <div className="dot-line">
                <div className="dot pickup"></div>
                <div className="line"></div>
                <div className="dot drop"></div>
              </div>
              <div className="route-text">
                <p><strong>From:</strong> {task.pickupAddress?.city || 'Store'}</p>
                <p><strong>To:</strong> {task.dropAddress?.city || 'Customer'}</p>
              </div>
            </div>

            <button 
              className="accept-radar-btn" 
              onClick={() => handleAccept(task._id)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Accepting...' : 'Accept Delivery'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyDeliveries;