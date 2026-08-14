const { z } = require('zod');

const getNotificationsQuerySchema = z.object({
  status: z.enum(['Pending', 'Later', 'Completed']).optional(),
});

const bulkDeleteQuerySchema = z.object({
  status: z.enum(['Pending', 'Later', 'Completed']).optional(),
});

module.exports = {
  getNotificationsQuerySchema,
  bulkDeleteQuerySchema,
};
