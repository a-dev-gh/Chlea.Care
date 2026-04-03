/**
 * Sanitize HTML by stripping dangerous tags (script, iframe, object, embed, form)
 * and event handler attributes (onclick, onerror, onload, etc).
 * Keeps safe formatting tags: b, strong, em, i, u, br, p, h1-h6, ul, ol, li, a, span, div.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Remove script tags and their content
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove dangerous tags (keep content)
  clean = clean.replace(/<\/?(?:iframe|object|embed|form|input|button|select|textarea|style|link|meta)\b[^>]*>/gi, '');

  // Remove event handler attributes
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Remove javascript: URLs
  clean = clean.replace(/href\s*=\s*["']?\s*javascript:[^"'>]*/gi, 'href="#"');

  return clean;
}
