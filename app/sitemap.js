import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default function sitemap() {
  const baseUrl = SITE_URL;

  // Marketing pages — these are the only pages Google should index
  const marketingPages = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/features`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/compare`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/changelog`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Comparison pages — high SEO value
  const comparisons = [
    "honeybook-alternative",
    "dubsado-alternative",
    "bonsai-alternative",
    "moxie-alternative",
    "plutio-alternative",
  ].map((slug) => ({
    url: `${baseUrl}/compare/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Blog posts — auto-generated from MDX files
  const posts = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...marketingPages, ...comparisons, ...posts];
}
