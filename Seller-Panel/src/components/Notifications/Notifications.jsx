import React, { useState, useEffect } from 'react';
import './Notifications.css';
import { FaBell } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const API = import.meta.env.VITE_API_URL;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Mark selected notification IDs as read
  const markNotificationsAsRead = async (ids) => {
    try {
      const token = localStorage.getItem('sellerToken');

      await Promise.all(
        ids.map(id =>
          fetch(`${API}/api/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )
      );

      // Update state
      setNotifications(prev =>
        prev.map(n => ids.includes(n._id) ? { ...n, read: true } : n)
      );

    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('sellerToken');

        const response = await fetch(`${API}/api/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        // 🔥 FIX: Always ensure it's an array
        setNotifications(Array.isArray(data) ? data : []);

      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]); // fallback
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggle = () => {
    const unreadNotifications = notifications.filter(n => !n.read);

    if (unreadNotifications.length > 0 && !isOpen) {
      const unreadIds = unreadNotifications.map(n => n._id);
      markNotificationsAsRead(unreadIds);
    }

    setIsOpen(!isOpen);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('sellerToken');

      await fetch(`${API}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNotifications(notifications.map(n => ({ ...n, read: true })));

    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('sellerToken');

      await fetch(`${API}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNotifications(
        notifications.map(n =>
          n._id === id ? { ...n, read: true } : n
        )
      );

    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('sellerToken');

      await fetch(`${API}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNotifications(
        notifications.filter(n => n._id !== id)
      );

    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const token = localStorage.getItem('sellerToken');

      await fetch(`${API}/api/notifications`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNotifications([]);

    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  return (
    <div className="notifications-container">
      <div className="notification-icon" onClick={handleToggle}>
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              <button onClick={handleMarkAllAsRead} className="mark-all-read-btn">
                Mark all as read
              </button>
              <button onClick={handleDeleteAllNotifications} className="delete-all-btn">
                Clear all
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="notification-item">No new notifications</div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              >
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <small>
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true
                    })}
                  </small>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notification._id);
                  }}
                  className="delete-notification-btn"
                  title="Delete notification"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
