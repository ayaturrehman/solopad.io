import fs from "fs";
import path from "path";
import { getAllPosts } from "@/lib/blog";
import BlogListing from "@/components/blog/BlogListing";

export const dynamic = "force-dynamic";


const DESCRIPTION =
  "Guides on freelance proposals, contracts, invoicing, pricing, and running your freelance business. Tips from the SoloPad team.";

export const metadata = {
  title: "Blog — Freelance Tips, Guides & Product Updates",
  description: DESCRIPTION,
  alternates: { canonical: "https://www.solopad.io/blog" },
  openGraph: {
    title: "Blog — Freelance Tips, Guides & Product Updates",
    description: DESCRIPTION,
    url: "https://www.solopad.io/blog",
    siteName: "SoloPad",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Freelance Tips, Guides & Product Updates",
    description: DESCRIPTION,
  },
};

function resolveCover(ogImage) {
  if (!ogImage) return null;
  const filePath = path.join(process.cwd(), "public", ogImage.replace(/^\//, ""));
  return fs.existsSync(filePath) ? ogImage : null;
}

export default function BlogPage() {
  const posts = getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    readingTime: post.readingTime,
    image: resolveCover(post.ogImage),
    publishedAt: post.publishedAt,
    publishedLabel: new Date(post.publishedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SoloPad Blog",
    description: DESCRIPTION,
    url: "https://www.solopad.io/blog",
    isPartOf: { "@type": "WebSite", name: "SoloPad", url: "https://www.solopad.io" },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.solopad.io/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogListing posts={posts} />
    </>
  );
}
