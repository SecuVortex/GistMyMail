import { z } from 'zod';

export const DigestCategorySchema = z.enum([
  'top_priority',
  'action_items',
  'deadlines',
  'meetings_and_events',
  'important_updates',
  'for_later',
  'needs_clarification'
]);

export const ExtractedActionRawSchema = z.object({
  title: z.string().min(1),
  action: z.string().nullable().default(null),
  evidenceQuote: z.string().default(''),
  deadlineText: z.string().nullable().default(null),
  deadlineIso: z.string().nullable().default(null),
  isExplicitDeadline: z.boolean().default(false),
  category: DigestCategorySchema.default('important_updates'),
  priority: z.number().min(1).max(10).default(5),
  uncertainties: z.array(z.string()).default([])
});

export const ExtractedEmailSummaryRawSchema = z.object({
  messageId: z.string(),
  summary: z.string().min(1),
  category: DigestCategorySchema.default('important_updates'),
  actions: z.array(ExtractedActionRawSchema).default([]),
  uncertainties: z.array(z.string()).default([])
});

export const ExtractedBatchResponseSchema = z.object({
  results: z.array(ExtractedEmailSummaryRawSchema)
});

export const UpdateAccountLabelSchema = z.object({
  label: z.string().min(1).max(50),
  isSelectedForDigest: z.boolean().optional()
});

export const UpdateDeliveryPreferencesSchema = z.object({
  enabled: z.boolean(),
  destinationAccountId: z.string().nullable(),
  deliveryTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be in HH:mm 24-hr format (e.g. 08:00)'),
  timezone: z.string().min(1)
});

export const GenerateDigestRequestSchema = z.object({
  accountIds: z.array(z.string()).optional(),
  maxMessagesPerAccount: z.number().min(1).max(100).default(15),
  useMockProvider: z.boolean().optional()
});
