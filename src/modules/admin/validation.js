const { z } = require('zod');

const onboardClientSchema = z.object({
  name: z.string().min(2, 'Agency/Client name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  subscriptionPlan: z.string().optional().default('Enterprise Plan'),
  price: z.number().nonnegative().optional().default(299),
  contactInquiryId: z.string().uuid().optional(),
  keywords: z.array(z.string()).optional(),
  destinations: z.array(z.string()).optional(),
});

module.exports = {
  onboardClientSchema,
};
