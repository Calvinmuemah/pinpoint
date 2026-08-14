const analyticsService = require('./service');
const { successResponse } = require('../../utils/api-response');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const metrics = await analyticsService.getDashboardSummary(userId);
    return successResponse(res, 200, metrics);
  } catch (error) {
    next(error);
  }
};

const getBreakdown = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const timeframe = req.query.timeframe || '30d';
    const breakdown = await analyticsService.getAnalyticsBreakdown(timeframe, userId);
    return successResponse(res, 200, breakdown);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getBreakdown,
};
