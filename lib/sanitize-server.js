/**
 * Server-safe HTML sanitizer that doesn't depend on jsdom.
 * Uses a whitelist approach with regex for basic tag/attribute filtering.
 * For print pages and server components only.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3",
  "ul", "ol", "li", "blockquote", "a", "img", "span",
  "table", "thead", "tbody", "tr", "th", "td",
  "div", "sub", "sup", "code", "pre", "hr",
]);

const ALLOWED_ATTR = new Set([
  "href", "src", "alt", "title", "class", "style",
  "target", "rel", "width", "height", "colspan", "rowspan",
]);

export function sanitizeHtmlServer(dirty) {
  if (!dirty) return "";

  // Remove script tags and their content entirely
  let clean = dirty.replace(/<script[\s\S]*?<\/script>/gi, "");
  // Remove style tags and their content
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Remove event handlers (on*)
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");
  // Remove javascript: URLs
  clean = clean.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="');

  // Strip disallowed tags but keep their content
  clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
    const lower = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) return "";

    // For closing tags, just return them
    if (match.startsWith("</")) return `</${lower}>`;

    // For opening tags, filter attributes
    const selfClosing = match.endsWith("/>") || lower === "br" || lower === "hr" || lower === "img";
    const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    const attrs = [];
    let m;
    while ((m = attrRegex.exec(match)) !== null) {
      const name = m[1].toLowerCase();
      const val = m[2] ?? m[3] ?? m[4] ?? "";
      if (ALLOWED_ATTR.has(name)) {
        attrs.push(`${name}="${val.replace(/"/g, "&quot;")}"`);
      }
    }
    const attrStr = attrs.length ? " " + attrs.join(" ") : "";
    return selfClosing ? `<${lower}${attrStr} />` : `<${lower}${attrStr}>`;
  });

  return clean;
}
