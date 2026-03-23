import { getAllPosts } from "@/lib/blog";

export default function sitemap() {
  const baseUrl = "https://solopad.io";

  // Marketing pages — these are the only pages Google should index
  const marketingPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
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
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Blog posts — auto-generated from MDX files
  const posts = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...marketingPages, ...comparisons, ...posts];
}
