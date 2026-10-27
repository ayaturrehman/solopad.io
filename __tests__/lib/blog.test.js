import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import fs from "fs";
import { getAllPosts, getAllSlugs, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import sitemap from "@/app/sitemap";

vi.mock("fs", () => ({
  default: { existsSync: vi.fn(), readdirSync: vi.fn(), readFileSync: vi.fn() },
}));

function setPosts(posts) {
  const files = Object.fromEntries(Object.entries(posts).map(([slug, fields]) => [
    `${slug}.mdx`,
    `---\n${JSON.stringify({ title: slug, slug, ...fields })}\n---\nArticle body.`,
  ]));
  fs.existsSync.mockReturnValue(true);
  fs.readdirSync.mockReturnValue(Object.keys(files));
  fs.readFileSync.mockImplementation((file) => files[file.split("/").pop()]);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-27T12:00:00Z"));
});
afterEach(() => vi.useRealTimers());

describe("blog publication", () => {
  it("excludes drafts, undated, invalid and scheduled articles from every public entry point", () => {
    setPosts({
      published: { publishedAt: "2026-10-26" },
      scheduled: { publishedAt: "2026-10-28" },
      draft: { publishedAt: "2026-10-26", draft: true },
      invalid: { publishedAt: "not-a-date" },
      undated: {},
    });
    expect(getAllPosts().map((post) => post.slug)).toEqual(["published"]);
    expect(getAllSlugs()).toEqual(["published"]);
    for (const slug of ["scheduled", "draft", "invalid", "undated", "missing"]) {
      expect(getPostBySlug(slug)).toBeNull();
    }
    expect(getPostBySlug("published").slug).toBe("published");
    expect(sitemap().filter((entry) => entry.url.includes("/blog/")))
      .toEqual([expect.objectContaining({ url: "https://www.solopad.io/blog/published" })]);
  });

  it("makes a scheduled article available when its publication date arrives", () => {
    setPosts({ scheduled: { publishedAt: "2026-10-28" } });
    expect(getPostBySlug("scheduled")).toBeNull();
    vi.setSystemTime(new Date("2026-10-28T00:00:00Z"));
    expect(getAllSlugs()).toEqual(["scheduled"]);
    expect(getPostBySlug("scheduled").slug).toBe("scheduled");
  });

  it("uses actual article updates in the sitemap and omits signup", () => {
    setPosts({ updated: { publishedAt: "2026-09-01", updatedAt: "2026-10-26" } });
    expect(getPostBySlug("updated").updatedAt).toBe("2026-10-26");
    const entries = sitemap();
    expect(entries.find((entry) => entry.url.endsWith("/blog/updated")).lastModified)
      .toEqual(new Date("2026-10-26"));
    expect(entries.some((entry) => entry.url.includes("signup"))).toBe(false);
    expect(entries.find((entry) => entry.url === "https://www.solopad.io").lastModified).toBeUndefined();
  });
});

describe("related articles", () => {
  it("prioritises shared topics over recent articles in a broad category", () => {
    const post = { slug: "invoice", category: "Templates", tags: ["invoicing", "UK", "templates"] };
    const posts = [
      post,
      { slug: "nda", category: "Templates", tags: ["contracts", "UK", "templates"], publishedAt: "2026-10-26" },
      { slug: "deposit", category: "Templates", tags: ["invoicing"], publishedAt: "2026-09-01" },
      { slug: "payment", category: "How-to", tags: ["invoicing"], publishedAt: "2026-09-02" },
    ];
    expect(getRelatedPosts(post, posts).map((item) => item.slug)).toEqual(["deposit", "payment", "nda"]);
  });

  it("does not suggest an unrelated article solely for generic UK or template tags", () => {
    const post = { slug: "invoice", category: "How-to", tags: ["UK", "templates"] };
    expect(getRelatedPosts(post, [{ slug: "nda", category: "Templates", tags: ["UK", "templates"] }])).toEqual([]);
  });
});
