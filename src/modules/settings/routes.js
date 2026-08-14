const express = require('express');
const router = express.Router();
const settingsController = require('./controller');
const authMiddleware = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validation.middleware');
const {
  updateKeywordsSchema,
  updateSourcesSchema,
  updateScoringRulesSchema,
} = require('./validation');

router.use(authMiddleware);

router.get('/', settingsController.getSettings);
router.put('/keywords', validate({ body: updateKeywordsSchema }), settingsController.updateKeywords);
router.put('/sources', validate({ body: updateSourcesSchema }), settingsController.updateSources);
router.put('/scoring-rules', validate({ body: updateScoringRulesSchema }), settingsController.updateScoringRules);

module.exports = router;
