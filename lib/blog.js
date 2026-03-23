import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

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

      // Skip drafts (no publishedAt or future date)
      if (!data.publishedAt) return null;
      const pubDate = new Date(data.publishedAt);
      if (pubDate > new Date()) return null;

      return {
        slug: data.slug || filename.replace(/\.mdx$/, ""),
        title: data.title,
        excerpt: data.excerpt || "",
        publishedAt: data.publishedAt,
        author: data.author || "SoloPad",
        category: data.category || "General",
        tags: data.tags || [],
        featured: data.featured || false,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.excerpt,
        ogImage: data.ogImage || null,
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

    return {
      slug: postSlug,
      title: data.title,
      excerpt: data.excerpt || "",
      publishedAt: data.publishedAt,
      author: data.author || "SoloPad",
      category: data.category || "General",
      tags: data.tags || [],
      featured: data.featured || false,
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription || data.excerpt,
      ogImage: data.ogImage || null,
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
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data } = matter(raw);
      return data.slug || filename.replace(/\.mdx$/, "");
    });
}
