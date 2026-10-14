const express = require('express');
const router = express.Router();
const contactController = require('../controllersAdminPanel/contact.controller');

router.post('/contact', contactController.createContactMessage);
router.get('/contact', contactController.getContactMessages);
router.put('/contact/:id', contactController.respondToMessage);
router.delete('/contact/:id', contactController.deleteContactMessage);

module.exports = router;