function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function stripHtml(value) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function isRichTextEmpty(value) {
  if (!value) return true;
  return stripHtml(String(value)).length === 0;
}

export function normalizeRichText(value) {
  if (!value) return null;
  const next = String(value).trim();
  return isRichTextEmpty(next) ? null : next;
}

function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function richTextToHtml(value) {
  if (!value) return "";
  const next = String(value).trim();
  if (!next) return "";
  if (looksLikeHtml(next)) return next;

  const paragraphs = next
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}
