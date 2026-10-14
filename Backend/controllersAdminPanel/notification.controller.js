const Notification = require('../models/notification.model');

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const recipientId = req.user._id; // Assuming req.user is populated by auth middleware
    let recipientModel;
    if (req.user.role === 'admin') {
      recipientModel = 'Admin';
    } else if (req.user.role === 'seller') {
      recipientModel = 'Seller';
    } else {
      recipientModel = 'User';
    }

    const notifications = await Notification.find({
      recipient: recipientId,
      recipientModel: recipientModel,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Ensure the user owns the notification
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const recipientId = req.user._id;
    const recipientModel = req.user.role === 'admin' ? 'Admin' : req.user.role === 'seller' ? 'Seller' : 'User';

    await Notification.updateMany(
      { recipient: recipientId, recipientModel: recipientModel, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Ensure the user owns the notification
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error });
  }
};

// @desc    Delete all notifications for the user
// @route   DELETE /api/notifications
// @access  Private
const deleteAllNotifications = async (req, res) => {
  try {
    const recipientId = req.user._id;
    const recipientModel = req.user.role === 'admin' ? 'Admin' : req.user.role === 'seller' ? 'Seller' : 'User';

    await Notification.deleteMany({
      recipient: recipientId,
      recipientModel: recipientModel,
    });

    res.status(200).json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notifications', error });
  }
};

module.exports = { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteAllNotifications };