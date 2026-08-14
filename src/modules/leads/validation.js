const { z } = require('zod');

const createLeadSchema = z.object({
  details: z.string().min(3, 'Details must be at least 3 characters'),
  destination: z.string().optional().default(''),
  travelType: z.string().optional().default('Leisure'),
  budget: z.number().nonnegative().optional().default(0),
  source: z.string().optional().default('Manual'),
});

const updateStatusSchema = z.object({
  status: z.enum(['New', 'Contacted', 'Pending', 'Later', 'Ignored'], {
    errorMap: () => ({ message: 'Status must be one of: New, Contacted, Pending, Later, Ignored' }),
  }),
});

const getLeadsQuerySchema = z.object({
  search: z.string().optional(),
  scoreFilter: z.enum(['Hot', 'Warm', 'Cool']).optional(),
  status: z.enum(['New', 'Contacted', 'Pending', 'Later', 'Ignored']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createLeadSchema,
  updateStatusSchema,
  getLeadsQuerySchema,
};
