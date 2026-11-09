const aiService = require('../services/aiService');

exports.getRecommendations = async (req, res, next) => {
  try {
    const { query, cartItems = [] } = req.body;
    const result = await aiService.recommend(query, cartItems);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

exports.compareProducts = async (req, res, next) => {
  try {
    const { product1Id, product2Id } = req.body;
    if (!product1Id || !product2Id) {
      return res.status(400).json({
        success: false,
        message: 'Both product1Id and product2Id are required for comparison.'
      });
    }
    const result = await aiService.compare(product1Id, product2Id);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

