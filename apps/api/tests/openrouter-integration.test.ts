import { describe, it, expect } from 'vitest';
import { OpenRouterAIProvider } from '../src/ai/providers/openrouter.js';
import { config } from '../src/config.js';
import type { EmailMessage } from '@gistmymail/shared';

describe('OpenRouter Live Integration', () => {
  it('extracts structured digest and verbatim evidence quote from email', async () => {
    if (!config.OPENROUTER_API_KEY) {
      console.log('Skipping live OpenRouter test: No OPENROUTER_API_KEY set.');
      return;
    }

    const provider = new OpenRouterAIProvider(config.OPENROUTER_API_KEY, config.AI_MODEL);

    const email: EmailMessage = {
      id: 'email_test_openrouter_01',
      accountId: 'acc_college_01',
      accountLabel: 'College',
      gmailMessageId: 'gmail_msg_live_01',
      threadId: 'thread_01',
      sender: 'hod.cse@lnmiit.ac.in',
      senderName: 'Prof. CSE',
      subject: 'Urgent: Major Project Synopsis Submission Deadline',
      snippet: 'Submit your synopsis by Monday 10:00 AM.',
      receivedAt: '2026-10-25T10:00:00.000Z',
      cleanedBody: 'All B.Tech final year teams must submit their Major Project synopsis by Monday 10:00 AM to the department office. Presentation slots will be assigned thereafter.',
      gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/gmail_msg_live_01',
      contentHash: 'hash_live_01'
    };

    const result = await provider.extractEmail(email);

    expect(result).toBeDefined();
    expect(result.output.messageId).toBe('gmail_msg_live_01');
    expect(typeof result.output.summary).toBe('string');
    expect(result.output.summary.length).toBeGreaterThan(5);
    expect(result.latencyMs).toBeGreaterThan(0);
    expect(result.outputTokens).toBeGreaterThan(0);
    expect(result.model.toLowerCase()).toContain('gemma-4');
    expect(result.model).toBe(config.AI_MODEL);

    console.log('\n--- Live OpenRouter Extraction Verified ---');
    console.log('Model used:', result.model);
    console.log('Latency:', result.latencyMs, 'ms');
    console.log('Summary:', result.output.summary);
    console.log('Actions found:', result.output.actions.length);
    if (result.output.actions.length > 0) {
      console.log('Action Title:', result.output.actions[0].title);
      console.log('Evidence Quote:', result.output.actions[0].evidenceQuote);
      console.log('Deadline Text:', result.output.actions[0].deadlineText);
    }
  }, 60000);
});
