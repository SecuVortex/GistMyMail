import type { EmailMessage, ExtractedEmailSummaryRaw } from '@gistmymail/shared';

export interface AIProviderResult {
  output: ExtractedEmailSummaryRaw;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  model: string;
}

export interface AIProvider {
  name: string;
  extractEmail(email: EmailMessage): Promise<AIProviderResult>;
}
