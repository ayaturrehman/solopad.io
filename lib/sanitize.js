import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3",
  "ul", "ol", "li", "blockquote", "a", "img", "span",
  "table", "thead", "tbody", "tr", "th", "td",
  "div", "sub", "sup", "code", "pre", "hr"
];

const ALLOWED_ATTR = [
  "href", "src", "alt", "title", "class", "style",
  "target", "rel", "width", "height", "colspan", "rowspan"
];

export function sanitizeHtml(dirty) {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
  });
}
