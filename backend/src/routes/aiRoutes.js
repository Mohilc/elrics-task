const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/recommend', aiController.getRecommendations);
router.post('/compare', aiController.compareProducts);

module.exports = router;

