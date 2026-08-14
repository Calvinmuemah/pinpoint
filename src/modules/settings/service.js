const settingsRepository = require('./repository');

const getSettings = async (userId) => {
  return await settingsRepository.getSettings(userId);
};

const updateKeywords = async (userId, keywords) => {
  return await settingsRepository.updateKeywords(userId, keywords);
};

const updateSources = async (userId, sources) => {
  return await settingsRepository.updateSources(userId, sources);
};

const updateScoringRules = async (userId, scoringRules) => {
  return await settingsRepository.updateScoringRules(userId, scoringRules);
};

module.exports = {
  getSettings,
  updateKeywords,
  updateSources,
  updateScoringRules,
};
