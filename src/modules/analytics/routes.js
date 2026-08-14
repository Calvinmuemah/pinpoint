const express = require('express');
const router = express.Router();
const analyticsController = require('./controller');
const authMiddleware = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validation.middleware');
const { breakdownQuerySchema } = require('./validation');

router.use(authMiddleware);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/breakdown', validate({ query: breakdownQuerySchema }), analyticsController.getBreakdown);

module.exports = router;
