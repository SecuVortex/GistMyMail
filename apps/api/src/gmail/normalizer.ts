import crypto from 'node:crypto';

export function cleanHtmlToText(html: string): string {
  if (!html) return '';
  // Remove script and style elements completely
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Replace line breaks and paragraph tags with newlines
  text = text.replace(/<br\s*[\/]?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  
  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Normalize multiple spaces and blank lines
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

export function parseSender(fromHeader: string): { name: string; email: string } {
  if (!fromHeader) return { name: 'Unknown Sender', email: 'unknown@example.com' };
  const match = fromHeader.match(/^(?:"?([^"]*)"?\s)?(?:<([^>]+)>)?$/);
  if (match) {
    const name = match[1]?.trim() || match[2] || fromHeader;
    const email = match[2]?.trim() || match[1] || fromHeader;
    return { name, email };
  }
  return { name: fromHeader, email: fromHeader };
}

export function createContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}
