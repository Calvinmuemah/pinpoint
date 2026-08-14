const notificationRepository = require('./repository');
const { NotFoundError } = require('../../utils/errors');

const getNotifications = async (userId, status) => {
  return await notificationRepository.findNotifications(userId, status);
};

const deleteNotification = async (id, userId) => {
  const deleted = await notificationRepository.deleteById(id, userId);
  if (!deleted) {
    throw new NotFoundError(`Notification with ID ${id} not found`);
  }
  return deleted;
};

const clearNotifications = async (userId, status) => {
  const count = await notificationRepository.deleteByStatus(userId, status);
  return { deletedCount: count };
};

module.exports = {
  getNotifications,
  deleteNotification,
  clearNotifications,
};
