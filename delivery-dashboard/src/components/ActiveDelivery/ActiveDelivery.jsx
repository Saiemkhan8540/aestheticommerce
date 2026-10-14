import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { MapPin, Loader2, Package, Phone, Map, Check, Navigation, X } from 'lucide-react';
import { getActiveTask, acceptTask, updateTaskStatus, rejectTask } from '../../Redux/deliveryTaskSlice'; 
import '../DeliveryPanel/DeliveryPanel.css'; 
import './ActiveDelivery.css'; 
import { Link } from 'react-router-dom';

const ActiveDelivery = () => {
  const dispatch = useDispatch();
  
  const { activeTask: task, loading, actionLoading, error } = useSelector((state) => state.deliveryTasks);

  useEffect(() => {
    dispatch(getActiveTask());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ✅ ADDED 'e' and e.preventDefault() to all these functions!
  const handleAccept = async (e, taskId) => {
    e.preventDefault(); 
    e.stopPropagation();
    const result = await dispatch(acceptTask(taskId));
    if (acceptTask.fulfilled.match(result)) toast.success("Task Accepted!");
  };

  const handleReject = async (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to reject this delivery?")) return;
    const result = await dispatch(rejectTask(taskId));
    if (rejectTask.fulfilled.match(result)) toast.info("Task Rejected.");
  };

  const handleUpdateStatus = async (e, taskId, newStatus) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await dispatch(updateTaskStatus({ taskId, status: newStatus }));
    if (updateTaskStatus.fulfilled.match(result)) toast.success(`Status updated to ${newStatus}`);
  };

  const openMaps = (e, addressObj) => {
    e.preventDefault();
    e.stopPropagation();
    if (!addressObj) return;
    const query = `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.pincode}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return '#f59e0b'; // Yellow/Orange
      case 'Accepted': return '#3b82f6'; // Blue
      case 'PickedUp': return '#8b5cf6'; // Purple
      case 'OutForDelivery': return '#ec4899'; // Pink
      case 'Delivered': return '#10b981'; // Green
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 size={48} className="spinner" />
        <p className="loading-text">Loading Active Deliveries...</p>
      </div>
    );
  }

  const tasksArray = Array.isArray(task) ? task : (task ? [task] : []);

  if (tasksArray.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <Package size={64} color="#d1d5db" />
          <h3 className="empty-title">No Active Deliveries</h3>
          <p className="empty-text">You currently have no active tasks. Stay online to receive new orders.</p>
          <button 
            className="action-btn primary" 
            style={{ marginTop: '16px', width: 'auto', padding: '10px 24px' }} 
            onClick={() => dispatch(getActiveTask())}
          >
            Refresh List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="title">Active Deliveries</h1>
          <p className="subtitle">Manage your current tasks ({tasksArray.length} ongoing)</p>
        </div>
      </div>

      <div className="grid">
        {tasksArray.map((singleTask, index) => {
          // Setup variables to keep the JSX clean
          const orderId = singleTask.order?.orderId || 'Unknown';
          const itemId = singleTask._id || '';

          return (
            <Link 
              key={singleTask._id} 
              to={`/order/${orderId}/${itemId}`} // ✅ Fixed the route parameters
              className="card" 
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`, cursor: 'pointer' }}
            >
              <div className="card-content" style={{ position: 'relative', paddingTop: '24px' }}>
                
                {/* Top Row: Order ID & Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span 
                    className="active-status-badge" 
                    style={{ backgroundColor: getStatusColor(singleTask.status), color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    {singleTask.status.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span className="order-id-text">Order #{orderId}</span>
                    <h3 className="card-title" style={{ marginTop: '4px', fontSize: '18px' }}>
                      Delivery Fee: ₹{singleTask.deliveryFee || 0}
                    </h3>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', margin: '16px 0' }}></div>

                {/* PICKUP SECTION */}
                <div className="card-address" style={{ alignItems: 'flex-start', marginBottom: '16px', display: 'flex' }}>
                  <MapPin size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ marginLeft: '12px', flex: 1 }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#374151' }}>Pickup: {singleTask.pickupAddress?.fullName}</p>
                    <p className="address-text">{singleTask.pickupAddress?.street}, {singleTask.pickupAddress?.city} {singleTask.pickupAddress?.pincode}</p>
                    <div className="quick-actions" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={(e) => openMaps(e, singleTask.pickupAddress)} className="quick-action-btn"><Map size={14}/> Map</button>
                      {singleTask.pickupContact?.phone && (
                        <a href={`tel:${singleTask.pickupContact.phone}`} onClick={(e) => e.stopPropagation()} className="quick-action-btn"><Phone size={14}/> Call</a>
                      )}
                    </div>
                  </div>
                </div>

                {/* DROP SECTION */}
                <div className="card-address" style={{ alignItems: 'flex-start', marginBottom: '24px', display: 'flex' }}>
                  <MapPin size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ marginLeft: '12px', flex: 1 }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#374151' }}>Drop: {singleTask.dropAddress?.fullName}</p>
                    <p className="address-text">{singleTask.dropAddress?.street}, {singleTask.dropAddress?.city} {singleTask.dropAddress?.pincode}</p>
                    <div className="quick-actions" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={(e) => openMaps(e, singleTask.dropAddress)} className="quick-action-btn"><Map size={14}/> Map</button>
                      {singleTask.dropContact?.phone && (
                        <a href={`tel:${singleTask.dropContact.phone}`} onClick={(e) => e.stopPropagation()} className="quick-action-btn"><Phone size={14}/> Call</a>
                      )}
                    </div>
                  </div>
                </div>

                {/* MAIN ACTION BUTTONS */}
                {/* ✅ We pass 'e' into the onClick handlers here */}
                <div className="task-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {singleTask.status === 'Assigned' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="action-btn success" onClick={(e) => handleAccept(e, singleTask._id)} disabled={actionLoading} style={{ flex: 1 }}>
                        <Check size={18} style={{ marginRight: '6px' }}/> Accept
                      </button>
                      <button className="action-btn danger" onClick={(e) => handleReject(e, singleTask._id)} disabled={actionLoading} style={{ flex: 1 }}>
                        <X size={18} style={{ marginRight: '6px' }}/> Reject
                      </button>
                    </div>
                  )}

                  {singleTask.status === 'Accepted' && (
                    <button className="action-btn primary" onClick={(e) => handleUpdateStatus(e, singleTask._id, 'PickedUp')} disabled={actionLoading}>
                      <Package size={18} style={{ marginRight: '6px' }}/> Mark as Picked Up
                    </button>
                  )}

                  {singleTask.status === 'PickedUp' && (
                    <button className="action-btn primary" onClick={(e) => handleUpdateStatus(e, singleTask._id, 'OutForDelivery')} disabled={actionLoading}>
                      <Navigation size={18} style={{ marginRight: '6px' }}/> Start Navigation (Out for Delivery)
                    </button>
                  )}

                  {singleTask.status === 'OutForDelivery' && (
                    <button className="action-btn success" onClick={(e) => handleUpdateStatus(e, singleTask._id, 'Delivered')} disabled={actionLoading}>
                      <Check size={18} style={{ marginRight: '6px' }}/> Mark as Delivered
                    </button>
                  )}
                </div>

              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveDelivery;