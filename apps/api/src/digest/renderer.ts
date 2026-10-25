import type { Digest, DigestItem } from '@gistmymail/shared';

function groupItems(items: DigestItem[]): Record<string, DigestItem[]> {
  const groups: Record<string, DigestItem[]> = {
    top_priority: [],
    deadlines: [],
    action_items: [],
    meetings_and_events: [],
    important_updates: [],
    for_later: [],
    needs_clarification: []
  };

  for (const item of items) {
    if (groups[item.category]) {
      groups[item.category].push(item);
    } else {
      groups.important_updates.push(item);
    }
  }

  return groups;
}

export function renderPlainTextDigest(digest: Digest, userName: string): string {
  const groups = groupItems(digest.items);
  let text = `====================================================\n`;
  text += ` GISTMYMAIL DAILY DIGEST\n`;
  text += ` Date: ${new Date(digest.generatedAt).toLocaleDateString()}\n`;
  text += ` Accounts Combined: ${digest.sourceAccountsCount} | Emails Processed: ${digest.processedMessagesCount}\n`;
  text += `====================================================\n\n`;

  if (digest.items.length === 0) {
    text += `No urgent actions, deadlines, or important updates found across your connected accounts today.\nEnjoy your day!\n`;
    return text;
  }

  const categoryTitles: Record<string, string> = {
    top_priority: '🔥 TOP PRIORITIES',
    deadlines: '⏰ UPCOMING DEADLINES',
    action_items: '⚡ ACTION ITEMS',
    meetings_and_events: '📅 MEETINGS & EVENTS',
    important_updates: '📌 IMPORTANT UPDATES',
    needs_clarification: '⚠️ NEEDS CLARIFICATION',
    for_later: '☕ FOR LATER'
  };

  for (const [cat, list] of Object.entries(groups)) {
    if (list.length === 0) continue;
    text += `\n--- ${categoryTitles[cat] || cat.toUpperCase()} ---\n\n`;
    for (const item of list) {
      text += `• [${item.accountLabel}] ${item.title}\n`;
      text += `  Summary: ${item.summary}\n`;
      if (item.deadlineText) {
        text += `  Deadline: ${item.deadlineText} (Verified in source: ${item.evidence.verifiedInSource ? 'YES' : 'FLAGGED'})\n`;
      }
      if (item.actionItem) {
        text += `  Action: ${item.actionItem}\n`;
      }
      if (item.evidence.quote) {
        text += `  Evidence: "${item.evidence.quote}"\n`;
      }
      if (item.uncertainties && item.uncertainties.length > 0) {
        text += `  Notes: ${item.uncertainties.join(' | ')}\n`;
      }
      text += `  Original Email: ${item.gmailUrl}\n\n`;
    }
  }

  text += `====================================================\n`;
  text += `Generated securely on your hardware by GistMyMail.\n`;
  return text;
}

export function renderHtmlDigest(digest: Digest, userName: string): string {
  const groups = groupItems(digest.items);

  const categoryHeadings: Record<string, { label: string; color: string; icon: string }> = {
    top_priority: { label: 'Top Priorities', color: '#dc2626', icon: '🔥' },
    deadlines: { label: 'Upcoming Deadlines', color: '#ea580c', icon: '⏰' },
    action_items: { label: 'Action Items', color: '#2563eb', icon: '⚡' },
    meetings_and_events: { label: 'Meetings & Events', color: '#0d9488', icon: '📅' },
    important_updates: { label: 'Important Updates', color: '#4b5563', icon: '📌' },
    needs_clarification: { label: 'Needs Clarification', color: '#b45309', icon: '⚠️' },
    for_later: { label: 'For Later', color: '#6b7280', icon: '☕' }
  };

  let sectionHtml = '';

  for (const [cat, list] of Object.entries(groups)) {
    if (list.length === 0) continue;
    const meta = categoryHeadings[cat] || { label: cat, color: '#374151', icon: '•' };

    let itemsHtml = '';
    for (const item of list) {
      itemsHtml += `
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-left: 4px solid ${meta.color}; border-radius: 6px; padding: 14px 18px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; background: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 4px;">
              ${item.accountLabel}
            </span>
            <span style="font-size: 11px; color: #6b7280;">From: ${item.sender}</span>
          </div>
          <h3 style="margin: 0 0 6px 0; font-size: 15px; color: #111827; font-weight: 600;">${item.title}</h3>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #4b5563; line-height: 1.4;">${item.summary}</p>
          ${item.deadlineText ? `
            <div style="background: #fff7ed; border: 1px solid #ffedd5; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px; font-size: 12px; color: #9a3412;">
              <strong>Deadline:</strong> ${item.deadlineText} 
              <span style="color: ${item.evidence.verifiedInSource ? '#15803d' : '#b45309'}; font-size: 11px; margin-left: 6px;">
                (${item.evidence.verifiedInSource ? '✓ Verified Quote' : '⚠ Unverified'})
              </span>
            </div>
          ` : ''}
          ${item.actionItem ? `
            <div style="font-size: 12px; color: #1d4ed8; margin-bottom: 6px;">
              <strong>Action:</strong> ${item.actionItem}
            </div>
          ` : ''}
          ${item.evidence.quote ? `
            <blockquote style="margin: 6px 0; padding: 4px 10px; background: #f9fafb; border-left: 2px solid #d1d5db; font-size: 11px; color: #6b7280; font-style: italic;">
              "${item.evidence.quote}"
            </blockquote>
          ` : ''}
          ${item.uncertainties && item.uncertainties.length > 0 ? `
            <div style="font-size: 11px; color: #b45309; background: #fefce8; padding: 4px 8px; border-radius: 4px; margin-top: 6px;">
              Note: ${item.uncertainties.join(' | ')}
            </div>
          ` : ''}
          <div style="margin-top: 10px; text-align: right;">
            <a href="${item.gmailUrl}" style="font-size: 11px; color: #4f46e5; text-decoration: none; font-weight: 600;">Open Original Email &rarr;</a>
          </div>
        </div>
      `;
    }

    sectionHtml += `
      <div style="margin-top: 24px;">
        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: ${meta.color}; margin-bottom: 12px; display: flex; align-items: center;">
          ${meta.icon} ${meta.label} (${list.length})
        </h2>
        ${itemsHtml}
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>GistMyMail Daily Digest</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px 12px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: #1e293b; padding: 20px 24px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700;">GistMyMail Daily Digest</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">
            ${new Date(digest.generatedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • ${digest.sourceAccountsCount} Inboxes Combined
          </p>
        </div>
        <div style="padding: 20px 24px;">
          ${sectionHtml || '<p style="color: #6b7280; font-size: 14px;">No actionable emails or pending deadlines today.</p>'}
        </div>
        <div style="background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          GistMyMail • Deterministic Evidence-Verified Email Digest<br>
          Emails analyzed on private local hardware.
        </div>
      </div>
    </body>
    </html>
  `;
}
