"use client";

import { sanitizeHtml } from "@/lib/sanitize";

export default function SanitizedHtml({ html, className }) {
  if (!html) return null;
  return (
    <p
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
