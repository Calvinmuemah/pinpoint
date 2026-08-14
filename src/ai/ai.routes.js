const express = require('express');
const router = express.Router();
const travelIntelligenceAgent = require('./agents/travel-intelligence.agent');
const authMiddleware = require('../middleware/auth.middleware');
const { successResponse } = require('../utils/api-response');
const { z } = require('zod');
const validate = require('../middleware/validation.middleware');

router.use(authMiddleware);

const analyzeTextSchema = z.object({
  text: z.string().min(3, 'Observation text must be at least 3 characters'),
  source: z.string().optional().default('Social Observation'),
});

/**
 * Live AI Text Analysis Endpoint
 * Analyzes any social post or inquiry and returns Gemini structured intelligence + business matching.
 */
router.post('/analyze', validate({ body: analyzeTextSchema }), async (req, res, next) => {
  try {
    const { text, source } = req.body;
    const result = await travelIntelligenceAgent.processObservation(text, source);
    return successResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
});

/**
 * Automated Agent Source & Keyword Scanner
 * Scans active platforms for user's configured keywords, extracts leads, and saves them to DB.
 */
router.post('/scan', async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const results = await travelIntelligenceAgent.scanSourcesForUser(userId);
    return successResponse(res, 200, {
      message: 'AI agent scan completed successfully',
      ...results,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
