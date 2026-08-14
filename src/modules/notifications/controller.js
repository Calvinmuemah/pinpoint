const notificationService = require('./service');
const { successResponse } = require('../../utils/api-response');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.id, req.query.status);
    return successResponse(res, 200, notifications);
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(req.params.id, req.user.id);
    return successResponse(res, 200, { message: 'Notification deleted successfully', id: result.id });
  } catch (error) {
    next(error);
  }
};

const clearNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.clearNotifications(req.user.id, req.query.status);
    return successResponse(res, 200, { message: 'Notifications cleared successfully', ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  deleteNotification,
  clearNotifications,
};
