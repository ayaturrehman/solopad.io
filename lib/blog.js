import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

function isPublished(data) {
  if (!data.publishedAt || data.draft === true) return false;
  const publishedAt = new Date(data.publishedAt).getTime();
  return Number.isFinite(publishedAt) && publishedAt <= Date.now();
}

/**
 * Get all blog posts, sorted by publishedAt (newest first).
 * Only returns published posts (publishedAt in the past or today).
 */
export function getAllPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files
    .map((filename) => {
      const filePath = path.join(BLOG_DIR, filename);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);

      if (!isPublished(data)) return null;

      return {
        slug: data.slug || filename.replace(/\.mdx$/, ""),
        title: data.title,
        excerpt: data.excerpt || "",
        publishedAt: data.publishedAt,
        updatedAt: data.updatedAt || data.publishedAt,
        author: data.author || "SoloPad",
        category: data.category || "General",
        tags: data.tags || [],
        featured: data.featured || false,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.excerpt,
        ogImage: data.ogImage || null,
        faq: Array.isArray(data.faq) ? data.faq : [],
        readingTime: readingTime(content).text,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return posts;
}

/**
 * Get a single post by slug. Returns frontmatter + raw MDX content.
 */
export function getPostBySlug(slug) {
  if (!fs.existsSync(BLOG_DIR)) return null;

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  for (const filename of files) {
    const filePath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    const postSlug = data.slug || filename.replace(/\.mdx$/, "");
    if (postSlug !== slug) continue;
    if (!isPublished(data)) return null;

    return {
      slug: postSlug,
      title: data.title,
      excerpt: data.excerpt || "",
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt || data.publishedAt,
      author: data.author || "SoloPad",
      category: data.category || "General",
      tags: data.tags || [],
      featured: data.featured || false,
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription || data.excerpt,
      ogImage: data.ogImage || null,
      faq: Array.isArray(data.faq) ? data.faq : [],
      readingTime: readingTime(content).text,
      content,
    };
  }

  return null;
}

/**
 * Get all slugs (for generateStaticParams).
 */
export function getAllSlugs() {
  return getAllPosts().map((post) => post.slug);
}

/** Prefer articles sharing specific topics, then the same category. */
export function getRelatedPosts(post, posts = getAllPosts(), limit = 3) {
  const genericTags = new Set(["uk", "freelance", "freelancing", "freelancers", "templates"]);
  const topics = new Set((post.tags || []).map((tag) => tag.toLowerCase()).filter((tag) => !genericTags.has(tag)));
  const score = (candidate) =>
    (candidate.tags || []).filter((tag) => topics.has(tag.toLowerCase())).length * 2 +
    Number(candidate.category === post.category);

  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({ candidate, score: score(candidate) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.candidate.publishedAt) - new Date(a.candidate.publishedAt))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
