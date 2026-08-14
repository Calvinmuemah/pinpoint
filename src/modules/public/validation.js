const { z } = require('zod');

const contactInquirySchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(255),
  businessName: z.string().max(255).optional().default(''),
  email: z.string().email('Invalid email address format'),
  industry: z.string().max(100).optional().default(''),
  message: z.string().min(5, 'Message must be at least 5 characters').max(2000),
});

module.exports = {
  contactInquirySchema,
};
