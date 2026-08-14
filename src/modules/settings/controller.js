const settingsService = require('./service');
const { successResponse } = require('../../utils/api-response');

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings(req.user.id);
    return successResponse(res, 200, settings);
  } catch (error) {
    next(error);
  }
};

const updateKeywords = async (req, res, next) => {
  try {
    const updated = await settingsService.updateKeywords(req.user.id, req.body.keywords);
    return successResponse(res, 200, { message: 'Keywords updated successfully', keywords: updated });
  } catch (error) {
    next(error);
  }
};

const updateSources = async (req, res, next) => {
  try {
    const updated = await settingsService.updateSources(req.user.id, req.body.sources);
    return successResponse(res, 200, { message: 'Sources updated successfully', sources: updated });
  } catch (error) {
    next(error);
  }
};

const updateScoringRules = async (req, res, next) => {
  try {
    const updated = await settingsService.updateScoringRules(req.user.id, req.body.scoringRules);
    return successResponse(res, 200, { message: 'Scoring rules updated successfully', scoringRules: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateKeywords,
  updateSources,
  updateScoringRules,
};
