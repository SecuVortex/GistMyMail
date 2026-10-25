import type { EmailMessage, ExtractedEmailSummaryRaw } from '@gistmymail/shared';
import type { AIProvider, AIProviderResult } from '../types.js';

export class MockAIProvider implements AIProvider {
  name = 'mock';

  async extractEmail(email: EmailMessage): Promise<AIProviderResult> {
    const startTime = Date.now();
    const text = email.cleanedBody.toLowerCase();

    const output: ExtractedEmailSummaryRaw = {
      messageId: email.gmailMessageId,
      summary: '',
      category: 'important_updates',
      actions: [],
      uncertainties: []
    };

    // Case 1: Explicit deadline in College account
    if (text.includes('lab report') && text.includes('28 october')) {
      output.summary = 'Prof. Sharma requires lab report 3 and signed form submission.';
      output.category = 'deadlines';
      output.actions.push({
        title: 'Submit Lab Report 3 and Signed Form',
        action: 'Submit signed form and lab report',
        evidenceQuote: 'Please submit the signed form and lab report by 5 PM on 28 October 2026.',
        deadlineText: '5 PM on 28 October 2026',
        deadlineIso: '2026-10-28T17:00:00+05:30',
        isExplicitDeadline: true,
        category: 'deadlines',
        priority: 9,
        uncertainties: []
      });
    }
    // Case 2: Meeting announcement
    else if (text.includes('mentorship meeting') || text.includes('conference room b')) {
      output.summary = 'Faculty mentorship meeting scheduled for tomorrow.';
      output.category = 'meetings_and_events';
      output.actions.push({
        title: 'Attend Faculty Mentorship Meeting',
        action: 'Attend mentorship meeting at Conference Room B',
        evidenceQuote: 'Faculty mentorship meeting scheduled for tomorrow at 2:00 PM in Conference Room B.',
        deadlineText: 'Tomorrow at 2:00 PM',
        deadlineIso: null,
        isExplicitDeadline: false,
        category: 'meetings_and_events',
        priority: 7,
        uncertainties: ['Relative date "tomorrow" depends on message received timestamp.']
      });
    }
    // Case 3: Ambiguous date symposium
    else if (text.includes('symposium') && text.includes('next friday')) {
      output.summary = 'Annual department symposium announced for next Friday.';
      output.category = 'needs_clarification';
      output.actions.push({
        title: 'Department Symposium',
        action: 'Mark calendar for symposium',
        evidenceQuote: 'The annual department symposium will take place next Friday.',
        deadlineText: 'next Friday',
        deadlineIso: null,
        isExplicitDeadline: false,
        category: 'needs_clarification',
        priority: 5,
        uncertainties: ['Ambiguous date: "next Friday" without calendar date or time.']
      });
    }
    // Case 4: No deadline proposal review
    else if (text.includes('proposal') && text.includes('no rush')) {
      output.summary = 'Alex Rivers sent partnership proposal for review when convenient.';
      output.category = 'action_items';
      output.actions.push({
        title: 'Review Partnership Proposal',
        action: 'Review attached partnership proposal and share thoughts',
        evidenceQuote: 'Please review the attached proposal when you have time. No rush at all, let us know your general thoughts.',
        deadlineText: null,
        deadlineIso: null,
        isExplicitDeadline: false,
        category: 'action_items',
        priority: 6,
        uncertainties: []
      });
    }
    // Case 5: Invoice payment notice
    else if (text.includes('invoice #1042') && text.includes('30 october')) {
      output.summary = 'Invoice #1042 for cloud consulting due on 30 October 2026.';
      output.category = 'deadlines';
      output.actions.push({
        title: 'Pay Cloud Consulting Invoice #1042',
        action: 'Process wire transfer for invoice #1042',
        evidenceQuote: 'Invoice #1042 for cloud consulting is due on 30 October 2026.',
        deadlineText: '30 October 2026',
        deadlineIso: '2026-10-30T23:59:59+05:30',
        isExplicitDeadline: true,
        category: 'deadlines',
        priority: 8,
        uncertainties: []
      });
    }
    // Default fallback
    else {
      output.summary = email.snippet || email.subject;
      output.category = 'important_updates';
    }

    const latencyMs = Math.max(15, Date.now() - startTime);

    return {
      output,
      inputTokens: Math.round(email.cleanedBody.length / 4) + 50,
      outputTokens: 120,
      latencyMs,
      model: 'deterministic-mock-v1'
    };
  }
}
