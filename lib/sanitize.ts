// lib/sanitize.ts
// ✅ sanitize.ts - بدون jsdom، يشتغل server + client

/**
 * دالة بسيطة لتنظيف HTML من tags الخطرة
 * بتشتغل على server و client بدون jsdom
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';

  // إزالة script tags ومحتواهن
  let clean = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // إزالة style tags ومحتواهن  
  clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // إزالة iframe, object, embed
  clean = clean.replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '');
  clean = clean.replace(/<(iframe|object|embed)[^>]*\/?>/gi, '');

  // إزالة event handlers
  clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

  // إزالة javascript: URLs
  clean = clean.replace(/javascript:/gi, '');

  // إزالة data: URLs
  clean = clean.replace(/data:[^;]*;base64,[^"']*/gi, '');

  // السماح بـ tags آمنة فقط
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'b', 'i',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'img', 'span', 'div',
    'blockquote', 'code', 'pre', 'hr'
  ];

  const tagRegex = /<(\/?)([\w]+)[^>]*>/g;
  clean = clean.replace(tagRegex, (match, closing, tag) => {
    const lowerTag = tag.toLowerCase();
    if (allowedTags.includes(lowerTag)) {
      if (lowerTag === 'a') {
        const hrefMatch = match.match(/href\s*=\s*["']([^"']*)["']/i);
        if (hrefMatch) {
          const href = hrefMatch[1];
          if (href.startsWith('javascript:') || href.startsWith('data:') || href.startsWith('vbscript:')) {
            return `<${closing}a href="#">`;
          }
        }
        return match;
      }
      if (lowerTag === 'img') {
        const srcMatch = match.match(/src\s*=\s*["']([^"']*)["']/i);
        if (srcMatch) {
          const src = srcMatch[1];
          if (src.startsWith('javascript:') || src.startsWith('data:') || src.startsWith('vbscript:')) {
            return '';
          }
        }
        return match;
      }
      return match;
    }
    return '';
  });

  return clean;
}

export default sanitizeHTML;
