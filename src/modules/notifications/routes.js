const express = require('express');
const router = express.Router();
const notificationController = require('./controller');
const authMiddleware = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validation.middleware');
const { getNotificationsQuerySchema, bulkDeleteQuerySchema } = require('./validation');

router.use(authMiddleware);

router.get('/', validate({ query: getNotificationsQuerySchema }), notificationController.getNotifications);
router.delete('/:id', notificationController.deleteNotification);
router.delete('/', validate({ query: bulkDeleteQuerySchema }), notificationController.clearNotifications);

module.exports = router;
