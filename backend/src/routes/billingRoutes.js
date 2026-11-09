const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.post('/calculate', billingController.calculate);

module.exports = router;

