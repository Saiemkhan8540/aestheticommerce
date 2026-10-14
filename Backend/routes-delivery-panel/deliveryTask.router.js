const express = require('express');
const { protectDelivery } = require('../MiddlewareDeliveryPanel/deliveryAuth.middleware');
const createDeliveryTaskSchema  = require("../validators/deliveryPanelValidators/createDeliveryTask.schema");
const { createDeliveryTask, acceptDeliveryTask, rejectDeliveryTask, getNearbyPartners,sendDeliveryRequest } = require('../controllersDeliveryPanel/deliveryTask.controller');
const router = express.Router();
const { protectSeller } = require("../MiddlewareSellerPanel/sellerPanelauthMidWar");
const  zodValidate  = require("../Middleware/zodValidate");
router.post('/create',protectSeller ,zodValidate(createDeliveryTaskSchema),createDeliveryTask);
router.post("/task/:deliveryTaskId/accept", protectDelivery, acceptDeliveryTask);
router.post("/task/:deliveryTaskId/reject", protectDelivery, rejectDeliveryTask)
router.post("/sendRequest/:deliveryTaskId", protectSeller , sendDeliveryRequest);
module.exports = router;