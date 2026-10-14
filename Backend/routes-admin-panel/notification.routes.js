const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteAllNotifications } = require('../controllersAdminPanel/notification.controller');
const { protect } = require('../Middleware/authMiddleware');

// Get all notifications for the logged-in user
router.get('/', protect, getNotifications);

// Mark a notification as read
router.put('/:id/read', protect, markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllNotificationsAsRead);

// Delete a notification
router.delete('/:id', protect, deleteNotification);

// Delete all notifications
router.delete('/', protect, deleteAllNotifications);

module.exports = router;