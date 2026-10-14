import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

/**
 * Axios instance with interceptors for authentication
 */
const deliveryAPI = axios.create({
    baseURL: `${API}/api/delivery`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
deliveryAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('deliveryToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
deliveryAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('deliveryToken');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ===================
// Authentication APIs
// ===================

/**
 * Login delivery personnel
 * @param {string} email - Delivery personnel email
 * @param {string} password - Delivery personnel password
 * @returns {Promise} Response with token
 */
export const loginDeliveryAPI = async (email, password) => {
    const response = await deliveryAPI.post('/login', { email, password });
    return response.data;
};

/**
 * Register new delivery personnel
 * @param {Object} userData - User registration data
 * @returns {Promise} Response with user data
 */
export const registerDeliveryAPI = async (userData) => {
    const response = await deliveryAPI.post('/register', userData);
    return response.data;
};

/**
 * Change availability of  delivery personnel
 * @param {Object} isAvailable - Rider availability status
 * @returns {Promise} Response with user data
 */

export const updateAvailabilityAPI = async (isAvailable) => {
  const response = await deliveryAPI.put("/availability", { isAvailable });
  return response.data;
};

/**
 * Verify authentication token
 * @returns {Promise} Response with verification status
 */
export const verifyTokenAPI = async () => {
    const response = await deliveryAPI.get('/verify');
    return response.data;
};

/**
 * Logout delivery personnel
 * @returns {Promise} Response
 */
export const logoutDeliveryAPI = async () => {
    const response = await deliveryAPI.post('/logout');
    localStorage.removeItem('deliveryToken');
    localStorage.removeItem('riderId');
    return response.data;
};

/**
 * Changes Location of delivery personnel
 * @returns {Promise} Response
 */
export const updateLocationAPI = async (lng, lat) => {
  const response = await deliveryAPI.put("/update-location", {
    lng,
    lat
  });

  return response.data;
};

/**
 * accept task
 * @returns {Promise} Response
 */
export const acceptDeliveryTaskAPI = async (taskId) => {

  const response = await deliveryAPI.post(
    "/accept-task",
    { taskId }
  );

  return response.data;

};

// ============
// Orders APIs
// ============

/**
 * Fetch the currently active delivery task
 * @returns {Promise} Response with active task data
 */
export const fetchActiveDeliveryTaskAPI = async () => {
    const response = await deliveryAPI.get('/active-deliveries');
    return response.data;
};


/**
 * Fetch nearby deliveries for the rider (within 5km)
 * @returns {Promise} Response with nearby tasks array
 */
export const fetchNearbyDeliveriesAPI = async () => {
    // Make sure this matches the route in your Express backend exactly!
    const response = await deliveryAPI.get('/nearby-Deliveries'); 
    return response.data;
};


/**
 * Reject delivery task
 * @returns {Promise} Response
 */
export const rejectDeliveryTaskAPI = async (taskId) => {
    const response = await deliveryAPI.post('/reject-task', { taskId });
    return response.data;
};

/**
 * Fetch all orders assigned to delivery personnel
 * @returns {Promise} Response with orders array
 */
export const fetchOrdersAPI = async () => {
    const response = await deliveryAPI.get('/orders');
    return response.data;
};

/**
 * Fetch single order by ID (legacy - use fetchTaskByIdAPI for task-based flow)
 * @param {string} orderId - Order ID
 * @returns {Promise} Response with order details
 */
export const fetchOrderByIdAPI = async (orderId) => {
    const response = await deliveryAPI.get(`/orders/${orderId}`);
    return response.data;
};

/**
 * Fetch single delivery task by ID (task-based dashboard)
 * @param {string} taskId - Delivery task ID
 * @returns {Promise} Response with task in dashboard shape
 */
export const fetchTaskByIdAPI = async (taskId) => {
    const response = await deliveryAPI.get(`/tasks/${taskId}`);
    return response.data;
};

/**
 * Update delivery task status (PickedUp | OutForDelivery | Delivered)
 * @param {string} taskId - Delivery task ID
 * @param {string} status - Backend status: PickedUp, OutForDelivery, Delivered
 * @returns {Promise} Response
 */
export const updateTaskStatusAPI = async (taskId, status) => {
    const response = await deliveryAPI.put('/task-status', { taskId, status });
    return response.data;
};


// /**
//  * Changes Location of delivery personnel
//  * @param {number} lng - Longitude
//  * @param {number} lat - Latitude
//  * @returns {Promise} Response
//  */
// export const updateLocationAPI = async (lng, lat) => {
//   const response = await deliveryAPI.put("/update-location", {
//     lng,
//     lat
//   });
//   return response.data;
// };


/**
 * Cancel delivery task
 * @param {string} taskId - Delivery task ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise} Response
 */
export const cancelTaskAPI = async (taskId, reason) => {
    const response = await deliveryAPI.put('/cancel-task', { taskId, reason });
    return response.data;
};

/**
 * Update order status (legacy - use updateTaskStatusAPI for task-based flow)
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise} Response with updated order
 */
export const updateOrderStatusAPI = async (orderId, status) => {
    const response = await deliveryAPI.patch(`/orders/${orderId}/status`, { status });
    return response.data;
};

/**
 * Mark order as delivered
 * @param {string} orderId - Order ID
 * @param {Object} deliveryData - Delivery confirmation data
 * @returns {Promise} Response with updated order
 */
export const markOrderDeliveredAPI = async (orderId, deliveryData = {}) => {
    const response = await deliveryAPI.post(`/orders/${orderId}/deliver`, deliveryData);
    return response.data;
};

/**
 * Cancel order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise} Response with updated order
 */
export const cancelOrderAPI = async (orderId, reason) => {
    const response = await deliveryAPI.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
};

/**
 * Update delivery location
 * @param {string} orderId - Order ID
 * @param {Object} location - Location coordinates {latitude, longitude}
 * @returns {Promise} Response
 */
export const updateDeliveryLocationAPI = async (orderId, location) => {
    const response = await deliveryAPI.patch(`/orders/${orderId}/location`, location);
    return response.data;
};

/**
 * Add delivery note to order
 * @param {string} orderId - Order ID
 * @param {string} note - Delivery note
 * @returns {Promise} Response with updated order
 */
export const addDeliveryNoteAPI = async (orderId, note) => {
    const response = await deliveryAPI.post(`/orders/${orderId}/notes`, { note });
    return response.data;
};

// ====================
// Delivery Stats APIs
// ====================

/**
 * Fetch delivery statistics
 * @returns {Promise} Response with delivery stats
 */
export const fetchDeliveryStatsAPI = async () => {
    const response = await deliveryAPI.get('/stats');
    return response.data;
};

/**
 * Fetch delivery history
 * @param {Object} params - Query parameters {startDate, endDate, status}
 * @returns {Promise} Response with delivery history
 */
export const fetchDeliveryHistoryAPI = async (params = {}) => {
    const response = await deliveryAPI.get('/history', { params });
    return response.data;
};

// =================
// Profile APIs
// =================

/**
 * Fetch delivery personnel profile
 * @returns {Promise} Response with profile data
 */
export const fetchProfileAPI = async () => {
    const response = await deliveryAPI.get('/profile');
    return response.data;
};

/**
 * Update delivery personnel profile
 * @param {Object} profileData - Profile update data
 * @returns {Promise} Response with updated profile
 */
export const updateProfileAPI = async (profileData) => {
    const response = await deliveryAPI.patch('/profile', profileData);
    return response.data;
};

/**
 * Upload profile picture
 * @param {File} file - Profile picture file
 * @returns {Promise} Response with image URL
 */
export const uploadProfilePictureAPI = async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await deliveryAPI.post('/profile/picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// ===================
// Notification APIs
// ===================

/**
 * Fetch notifications
 * @returns {Promise} Response with notifications array
 */
export const fetchNotificationsAPI = async () => {
    const response = await deliveryAPI.get('/notifications');
    return response.data;
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise} Response
 */
export const markNotificationReadAPI = async (notificationId) => {
    const response = await deliveryAPI.patch(`/notifications/${notificationId}/read`);
    return response.data;
};

/**
 * Mark all notifications as read
 * @returns {Promise} Response
 */
export const markAllNotificationsReadAPI = async () => {
    const response = await deliveryAPI.patch('/notifications/read-all');
    return response.data;
};

// =================
// Support APIs
// =================

/**
 * Contact support
 * @param {Object} supportData - Support request data {subject, message}
 * @returns {Promise} Response
 */
export const contactSupportAPI = async (supportData) => {
    const response = await deliveryAPI.post('/support', supportData);
    return response.data;
};

/**
 * Report an issue
 * @param {string} orderId - Order ID
 * @param {Object} issueData - Issue details {type, description}
 * @returns {Promise} Response
 */
export const reportIssueAPI = async (orderId, issueData) => {
    const response = await deliveryAPI.post(`/orders/${orderId}/report`, issueData);
    return response.data;
};

export default deliveryAPI;
