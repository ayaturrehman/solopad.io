import { describe, it, expect } from "vitest";
import { sanitizeHtmlServer } from "@/lib/sanitize-server";

describe("sanitizeHtmlServer (XSS Prevention)", () => {
  it("strips script tags", () => {
    const result = sanitizeHtmlServer('<p>Hello</p><script>alert("xss")</script>');
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
    expect(result).toContain("Hello");
  });

  it("strips event handlers", () => {
    const result = sanitizeHtmlServer('<p onmouseover="alert(1)">Text</p>');
    expect(result).not.toContain("onmouseover");
    expect(result).toContain("Text");
  });

  it("strips javascript: URLs", () => {
    const result = sanitizeHtmlServer('<a href="javascript:alert(1)">Click</a>');
    expect(result).not.toContain("javascript:");
  });

  it("preserves safe HTML", () => {
    const result = sanitizeHtmlServer("<p>Hello <strong>world</strong></p>");
    expect(result).toContain("<p>");
    expect(result).toContain("<strong>");
    expect(result).toContain("world");
  });

  it("handles null/undefined input", () => {
    expect(sanitizeHtmlServer(null)).toBe("");
    expect(sanitizeHtmlServer(undefined)).toBe("");
    expect(sanitizeHtmlServer("")).toBe("");
  });

  it("strips iframe tags", () => {
    const result = sanitizeHtmlServer('<iframe src="https://evil.com"></iframe>');
    expect(result).not.toContain("<iframe");
  });

  it("strips script from data: URLs in images", () => {
    const result = sanitizeHtmlServer('<img src="data:text/html,<script>alert(1)</script>">');
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert(1)");
  });
});
