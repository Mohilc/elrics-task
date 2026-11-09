const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/status', adminController.getSystemStatus);
router.post('/reset', adminController.resetData);

module.exports = router;

