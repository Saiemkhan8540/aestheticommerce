const express = require("express");
const router = express.Router();

const {
    loginDelivery,
    verifyToken,
    getMyTasks,
    getTaskById,
    registerPartner,
    updateLocation,
    acceptTask,
    updateTaskStatus,
    getNearByDeliveries,
    getProfile,
    getMyActiveTask,
    cancelTask,
    rejectTask,
    updateAvailability
} = require("../controllersDeliveryPanel/delivery.controller.js");
const { protectDelivery } = require("../MiddlewareDeliveryPanel/deliveryAuth.middleware.js");
const zodValidate = require("../Middleware/zodValidate.js");
const deliveryRegisterSchema = require("../validators/deliveryPanelValidators/deliveryRegister.schema.js");
const deliveryLoginSchema = require("../validators/deliveryPanelValidators/deliveryLogin.schema.js");
const updateLocationSchema = require("../validators/deliveryPanelValidators/deliveryUpdateLocation.schema.js");
const updateTaskStatusSchema = require("../validators/deliveryPanelValidators/deliveryupdateStatus.schema.js");
const acceptTaskSchema = require("../validators/deliveryPanelValidators/deliveryAccept.schema.js");
const cancelTaskSchema = require("../validators/deliveryPanelValidators/deliveryCancel.schema.js");
const rejectTaskSchema = require("..//validators/deliveryPanelValidators/rejectTask.Schema.js");
// Delivery partner routes
router.post("/login",zodValidate(deliveryLoginSchema), loginDelivery);
router.get("/verify", protectDelivery, verifyToken);
router.get("/orders", protectDelivery, getMyTasks);
router.get("/tasks/:taskId", protectDelivery, getTaskById);
router.post("/register",zodValidate(deliveryRegisterSchema),registerPartner);
router.get("/nearby-Deliveries",protectDelivery,getNearByDeliveries);
router.get("/me",protectDelivery,getProfile);
router.put("/update-location",protectDelivery,zodValidate(updateLocationSchema),updateLocation);
router.post("/accept-task",protectDelivery,zodValidate(acceptTaskSchema),acceptTask);
router.put("/task-status",protectDelivery,zodValidate(updateTaskStatusSchema),updateTaskStatus);
router.get("/active-deliveries",protectDelivery,getMyActiveTask);
router.put("/cancel-task",protectDelivery,zodValidate(cancelTaskSchema),cancelTask);
router.post("/reject-task",protectDelivery,zodValidate(rejectTaskSchema),rejectTask);
router.put("/availability",protectDelivery , updateAvailability);
module.exports = router;
