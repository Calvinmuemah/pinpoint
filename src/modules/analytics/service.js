const analyticsRepository = require('./repository');

const getDashboardSummary = async (userId) => {
  return await analyticsRepository.getDashboardMetrics(userId);
};

const getAnalyticsBreakdown = async (timeframe, userId) => {
  return await analyticsRepository.getBreakdownMetrics(timeframe, userId);
};

module.exports = {
  getDashboardSummary,
  getAnalyticsBreakdown,
};
