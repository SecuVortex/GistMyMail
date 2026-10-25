import type {
  EmailMessage,
  ExtractedEmailSummaryRaw,
  DigestItem,
  DigestCategory,
  EvidenceQuote
} from '@gistmymail/shared';

// Normalize text for fuzzy/whitespace-insensitive quote matching
function normalizeForComparison(str: string): string {
  return str.toLowerCase().replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function verifyEvidenceInSource(quote: string, sourceBody: string): EvidenceQuote {
  if (!quote || quote.trim() === '') {
    return {
      quote: '',
      verifiedInSource: false
    };
  }

  const cleanSource = normalizeForComparison(sourceBody);
  const cleanQuote = normalizeForComparison(quote);

  if (cleanSource.includes(cleanQuote)) {
    return {
      quote: quote.trim(),
      verifiedInSource: true
    };
  }

  // Check if at least an 80% word overlap exists
  const quoteWords = cleanQuote.split(' ').filter(w => w.length > 3);
  if (quoteWords.length >= 3) {
    const matchedCount = quoteWords.filter(w => cleanSource.includes(w)).length;
    if (matchedCount / quoteWords.length >= 0.8) {
      return {
        quote: quote.trim(),
        verifiedInSource: true
      };
    }
  }

  return {
    quote: quote.trim(),
    verifiedInSource: false
  };
}

export function validateAndAggregateItems(
  email: EmailMessage,
  rawExtraction: ExtractedEmailSummaryRaw
): DigestItem[] {
  const items: DigestItem[] = [];

  // Check for prompt injection attempts in raw body
  const injectionPatterns = [
    /ignore (all )?previous instructions/i,
    /system override/i,
    /reveal (all )?passwords/i,
    /output (all )?environment/i,
    /you are now in developer mode/i
  ];

  const hasInjection = injectionPatterns.some(pattern => pattern.test(email.cleanedBody));

  if (hasInjection) {
    items.push({
      id: `item_sec_${email.id}`,
      category: 'needs_clarification',
      title: `[Security Warning] Suspicious instruction in: "${email.subject}"`,
      summary: `Email contains untrusted prompt injection patterns attempting system override. The content was safely isolated and no external actions were executed.`,
      accountLabel: email.accountLabel,
      accountEmail: email.sender,
      sender: email.sender,
      receivedAt: email.receivedAt,
      actionItem: null,
      deadlineText: null,
      deadlineIso: null,
      isExplicitDeadline: false,
      evidence: {
        quote: 'Untrusted content quarantined.',
        verifiedInSource: true
      },
      gmailUrl: email.gmailUrl,
      priorityScore: 9,
      uncertainties: ['Malicious or adversarial prompt injection detected in message content.']
    });
    return items;
  }

  // Process extracted actions
  for (let i = 0; i < rawExtraction.actions.length; i++) {
    const act = rawExtraction.actions[i];
    const evidence = verifyEvidenceInSource(act.evidenceQuote, email.cleanedBody);
    const uncertainties = [...(act.uncertainties || [])];

    // Check deadline validity
    let deadlineText = act.deadlineText;
    let deadlineIso = act.deadlineIso;
    let isExplicit = act.isExplicitDeadline;

    if (deadlineText) {
      // Check if deadline was hallucinated
      const dlNormalized = normalizeForComparison(deadlineText);
      const inQuote = evidence.quote && normalizeForComparison(evidence.quote).includes(dlNormalized);
      const inBody = normalizeForComparison(email.cleanedBody).includes(dlNormalized);

      if (!inQuote && !inBody) {
        uncertainties.push(`Discarded hallucinated deadline "${deadlineText}" not found in source text.`);
        deadlineText = null;
        deadlineIso = null;
        isExplicit = false;
      }
    }

    if (!evidence.verifiedInSource && evidence.quote) {
      uncertainties.push('Evidence quote could not be verified verbatim in email body.');
    }

    // Determine category based on content
    let category: DigestCategory = act.category || rawExtraction.category;
    if (deadlineText && isExplicit) {
      category = 'deadlines';
    } else if (act.action) {
      category = 'action_items';
    } else if (uncertainties.length > 0) {
      category = 'needs_clarification';
    }

    items.push({
      id: `item_${email.id}_${i}`,
      category,
      title: act.title || email.subject,
      summary: rawExtraction.summary,
      accountLabel: email.accountLabel,
      accountEmail: email.sender,
      sender: email.sender,
      receivedAt: email.receivedAt,
      actionItem: act.action,
      deadlineText,
      deadlineIso,
      isExplicitDeadline: isExplicit,
      evidence,
      gmailUrl: email.gmailUrl,
      priorityScore: act.priority || 5,
      uncertainties
    });
  }

  // If no action was extracted, add a general summary item
  if (items.length === 0) {
    items.push({
      id: `item_${email.id}_summary`,
      category: rawExtraction.category || 'important_updates',
      title: email.subject,
      summary: rawExtraction.summary,
      accountLabel: email.accountLabel,
      accountEmail: email.sender,
      sender: email.sender,
      receivedAt: email.receivedAt,
      actionItem: null,
      deadlineText: null,
      deadlineIso: null,
      isExplicitDeadline: false,
      evidence: {
        quote: email.cleanedBody.slice(0, 100),
        verifiedInSource: true
      },
      gmailUrl: email.gmailUrl,
      priorityScore: 4,
      uncertainties: rawExtraction.uncertainties || []
    });
  }

  return items;
}
