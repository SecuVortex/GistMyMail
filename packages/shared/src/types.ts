export type PurposeLabel = 'College' | 'Business' | 'Clients' | 'Personal' | 'Newsletter' | string;

export interface User {
  id: string;
  email: string;
  name: string;
  googleSub: string;
  createdAt: string;
}

export interface ConnectedAccount {
  id: string;
  userId: string;
  email: string;
  label: PurposeLabel;
  googleSub: string;
  hasSendPermission: boolean;
  isSelectedForDigest: boolean;
  status: 'connected' | 'needs_reauth' | 'disconnected';
  lastSyncAt: string | null;
  createdAt: string;
}

export interface EmailMessage {
  id: string;
  accountId: string;
  accountLabel: string;
  gmailMessageId: string;
  threadId: string;
  sender: string;
  senderName: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  cleanedBody: string;
  gmailUrl: string;
  contentHash: string;
}

export type DigestCategory =
  | 'top_priority'
  | 'action_items'
  | 'deadlines'
  | 'meetings_and_events'
  | 'important_updates'
  | 'for_later'
  | 'needs_clarification';

export interface EvidenceQuote {
  quote: string;
  charStart?: number;
  charEnd?: number;
  verifiedInSource: boolean;
}

export interface DigestItem {
  id: string;
  category: DigestCategory;
  title: string;
  summary: string;
  accountLabel: string;
  accountEmail: string;
  sender: string;
  receivedAt: string;
  actionItem: string | null;
  deadlineText: string | null;
  deadlineIso: string | null;
  isExplicitDeadline: boolean;
  evidence: EvidenceQuote;
  gmailUrl: string;
  priorityScore: number; // 1-10
  uncertainties: string[];
}

export interface Digest {
  id: string;
  userId: string;
  generatedAt: string;
  sourceAccountsCount: number;
  processedMessagesCount: number;
  items: DigestItem[];
  summaryNote: string;
  deliveredAt: string | null;
  destinationAccountEmail: string | null;
  deliveryStatus: 'pending' | 'delivered' | 'failed' | 'not_scheduled';
}

export interface DeliveryPreference {
  userId: string;
  enabled: boolean;
  destinationAccountId: string | null;
  destinationAccountEmail: string | null;
  deliveryTime: string; // HH:mm in 24hr format, e.g. "08:00"
  timezone: string; // e.g. "Asia/Kolkata"
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
}

export interface DeliveryLog {
  id: string;
  userId: string;
  digestId: string;
  destinationEmail: string;
  status: 'success' | 'failed' | 'retrying';
  attemptCount: number;
  gmailMessageId: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export type AIProviderType = 'mock' | 'openrouter' | 'ollama';

export interface ExtractedActionRaw {
  title: string;
  action: string | null;
  evidenceQuote: string;
  deadlineText: string | null;
  deadlineIso: string | null;
  isExplicitDeadline: boolean;
  category: DigestCategory;
  priority: number;
  uncertainties: string[];
}

export interface ExtractedEmailSummaryRaw {
  messageId: string;
  summary: string;
  category: DigestCategory;
  actions: ExtractedActionRaw[];
  uncertainties: string[];
}
