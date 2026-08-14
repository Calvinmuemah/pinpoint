const { z } = require('zod');

const breakdownQuerySchema = z.object({
  timeframe: z.enum(['7d', '30d', 'all']).optional().default('30d'),
});

module.exports = {
  breakdownQuerySchema,
};
