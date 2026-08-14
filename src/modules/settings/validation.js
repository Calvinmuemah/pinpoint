const { z } = require('zod');

const updateKeywordsSchema = z.object({
  keywords: z.array(z.string().min(1, 'Keyword cannot be empty')).min(1, 'At least one keyword must be provided'),
});

const updateSourcesSchema = z.object({
  sources: z.array(
    z.object({
      id: z.string().optional(),
      source: z.string().optional(),
      enabled: z.boolean(),
    })
  ).min(1, 'At least one source configuration must be provided'),
});

const updateScoringRulesSchema = z.object({
  scoringRules: z.array(
    z.object({
      id: z.string().optional(),
      criterion: z.string().min(1, 'Criterion is required'),
      weight: z.number().int().min(0, 'Weight must be non-negative').max(100, 'Weight cannot exceed 100'),
      description: z.string().optional().default(''),
      enabled: z.boolean().optional().default(true),
    })
  ).min(1, 'At least one scoring rule must be provided'),
});

module.exports = {
  updateKeywordsSchema,
  updateSourcesSchema,
  updateScoringRulesSchema,
};
