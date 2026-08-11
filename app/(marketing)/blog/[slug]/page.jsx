import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { getPostBySlug, getAllSlugs, getAllPosts } from "@/lib/blog";
import { getBlogIcon, BlogHeroIllustration } from "@/components/blog/BlogIcons";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: `https://www.solopad.io/blog/${post.slug}` },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://www.solopad.io/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      ...(post.ogImage && { images: [{ url: post.ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
    },
  };
}

function PostIcon({ slug, category, size = 48 }) {
  const Icon = getBlogIcon(slug, category);
  return <Icon size={size} color="#2563EB" />;
}

// Section icons for H2 headings — subtle visual markers
function SectionIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 8, opacity: 0.5 }}>
      <rect x="2" y="2" width="16" height="16" rx="4" stroke="#2563EB" strokeWidth="1.5" />
      <path d="M7 10h6M10 7v6" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const mdxComponents = {
  h2: (props) => <h2 className="bp-h2" {...props} />,
  h3: (props) => <h3 className="bp-h3" {...props} />,
  p: (props) => <p className="bp-p" {...props} />,
  ul: (props) => <ul className="bp-ul" {...props} />,
  ol: (props) => <ol className="bp-ol" {...props} />,
  li: (props) => <li className="bp-li" {...props} />,
  strong: (props) => <strong className="bp-strong" {...props} />,
  a: (props) => <a className="bp-a" {...props} />,
  blockquote: (props) => <blockquote className="bp-quote" {...props} />,
  hr: () => <hr className="bp-hr" />,
  img: (props) => <img className="bp-img" {...props} alt={props.alt || ""} loading="lazy" />,
  table: (props) => (
    <div className="bp-table-wrap">
      <table className="bp-table" {...props} />
    </div>
  ),
  th: (props) => <th className="bp-th" {...props} />,
  td: (props) => <td className="bp-td" {...props} />,
};

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const related = allPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.metaDescription,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        author: { "@type": "Person", name: post.author },
        publisher: { "@type": "Organization", name: "SoloPad", url: "https://www.solopad.io" },
        mainEntityOfPage: `https://www.solopad.io/blog/${post.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.solopad.io" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.solopad.io/blog" },
          { "@type": "ListItem", position: 3, name: post.title, item: `https://www.solopad.io/blog/${post.slug}` },
        ],
      },
      ...(post.faq?.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: post.faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }} />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .blog-post-page {
              --bp-fg: #111;
              --bp-fg-soft: #222;
              --bp-body: #444;
              --bp-muted: #555;
              --bp-faint: #888;
              --bp-ghost: #999;
              --bp-card: #ffffff;
              --bp-card-border: #F1F5F9;
              --bp-surface: #F8FAFC;
              --bp-surface-2: #FAFBFC;
              --bp-line: #E2E8F0;
              --bp-accent-soft: #EFF6FF;
              --bp-accent-border: #DBEAFE;
              --bp-hero-bg: linear-gradient(135deg, #EFF6FF 0%, #F0F4FF 50%, #F8FAFF 100%);
              --bp-tag-bg: #F8FAFC;
              --bp-tag-fg: #666;
              --bp-related-hover-shadow: rgba(0,0,0,0.06);
              --bp-img-bg: #F8FAFC;
              --bp-th-fg: #666;
            }
            html[data-theme="dark"] .blog-post-page {
              --bp-fg: #f4f4f5;
              --bp-fg-soft: #e4e4e7;
              --bp-body: #a1a1aa;
              --bp-muted: #a1a1aa;
              --bp-faint: #a1a1aa;
              --bp-ghost: #71717a;
              --bp-card: #18181b;
              --bp-card-border: #27272a;
              --bp-surface: #18181b;
              --bp-surface-2: #111113;
              --bp-line: #3f3f46;
              --bp-accent-soft: rgba(37,99,235,0.18);
              --bp-accent-border: #1e3a5f;
              --bp-hero-bg: linear-gradient(135deg, #111827 0%, #18181b 55%, #09090b 100%);
              --bp-tag-bg: #18181b;
              --bp-tag-fg: #a1a1aa;
              --bp-related-hover-shadow: rgba(0,0,0,0.4);
              --bp-img-bg: #111113;
              --bp-th-fg: #a1a1aa;
            }
            @keyframes blogFadeUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes heroShimmer {
              0% { opacity: 0.04; }
              50% { opacity: 0.08; }
              100% { opacity: 0.04; }
            }
            .blog-post-hero { animation: blogFadeUp 0.6s ease-out; }
            .blog-post-content { animation: blogFadeUp 0.6s ease-out 0.15s both; }
            .blog-post-footer { animation: blogFadeUp 0.6s ease-out 0.3s both; }
            .blog-hero-illustration { animation: heroShimmer 4s ease-in-out infinite; }
            .blog-hero-banner {
              background: var(--bp-hero-bg);
              border: 1px solid var(--bp-accent-border);
            }
            .blog-hero-icon {
              background: var(--bp-card);
              border: 1px solid var(--bp-accent-border);
            }
            .blog-tag {
              transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
              cursor: default;
              background: var(--bp-tag-bg);
              color: var(--bp-tag-fg);
              border: 1px solid var(--bp-card-border);
            }
            .blog-tag:hover {
              background: #2563EB !important;
              color: white !important;
              border-color: #2563EB !important;
            }
            .blog-related-link {
              transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
              background: var(--bp-card);
              border: 1px solid var(--bp-card-border);
            }
            .blog-related-link:hover {
              transform: translateY(-3px);
              box-shadow: 0 8px 24px var(--bp-related-hover-shadow);
              border-color: var(--bp-accent-border) !important;
            }
            .blog-related-link:hover .related-icon-wrap {
              background: var(--bp-accent-soft) !important;
              transform: scale(1.05);
            }
            .related-icon-wrap {
              transition: background 0.2s ease, transform 0.2s ease;
              background: var(--bp-surface);
            }
            .blog-cta-section { transition: transform 0.2s ease; }
            .blog-cta-section:hover { transform: scale(1.01); }
            .blog-cta-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
            .blog-cta-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(37,99,235,0.3);
            }
            .blog-back-link {
              transition: color 0.2s ease;
              color: var(--bp-ghost);
            }
            .blog-back-link:hover { color: #2563EB !important; }
            .blog-back-link:hover svg { transform: translateX(-2px); }
            .blog-back-link svg { transition: transform 0.2s ease; }

            .bp-h2 {
              font-size: 26px; font-weight: 700; margin-top: 52px; margin-bottom: 16px;
              line-height: 1.35; color: var(--bp-fg); letter-spacing: -0.02em;
              display: flex; align-items: center; gap: 0;
            }
            .bp-h3 {
              font-size: 20px; font-weight: 600; margin-top: 36px; margin-bottom: 12px;
              line-height: 1.4; color: var(--bp-fg-soft);
            }
            .bp-p {
              font-size: 17px; line-height: 1.85; margin-bottom: 24px;
              color: var(--bp-body); font-weight: 400;
            }
            .bp-ul, .bp-ol { margin-bottom: 24px; padding-left: 24px; }
            .bp-li {
              font-size: 17px; line-height: 1.85; margin-bottom: 8px; color: var(--bp-body);
            }
            .bp-strong { font-weight: 600; color: var(--bp-fg); }
            .bp-a {
              color: #2563EB; text-decoration: none; border-bottom: 1px solid #93C5FD;
              transition: border-color 0.2s, color 0.2s;
            }
            html[data-theme="dark"] .bp-a { border-bottom-color: #1e3a5f; color: #60a5fa; }
            .bp-quote {
              border-left: 3px solid #2563EB; padding-left: 24px; margin-left: 0;
              margin-bottom: 24px; color: var(--bp-muted); font-style: italic;
              font-size: 18px; line-height: 1.7;
            }
            .bp-hr {
              border: none; height: 1px; margin: 48px 0;
              background: linear-gradient(90deg, transparent, var(--bp-line), transparent);
            }
            .bp-img {
              width: 100%; height: auto; border-radius: 16px;
              border: 1px solid var(--bp-line); margin: 8px 0 32px;
              background: var(--bp-img-bg);
            }
            .bp-table-wrap {
              overflow-x: auto; margin-bottom: 28px; border-radius: 12px;
              border: 1px solid var(--bp-card-border);
            }
            .bp-table { width: 100%; border-collapse: collapse; font-size: 15px; line-height: 1.6; }
            .bp-th {
              text-align: left; padding: 12px 16px; border-bottom: 2px solid var(--bp-line);
              font-weight: 600; font-size: 13px; color: var(--bp-th-fg);
              text-transform: uppercase; letter-spacing: 0.05em; background: var(--bp-surface-2);
            }
            .bp-td {
              padding: 12px 16px; border-bottom: 1px solid var(--bp-card-border); color: var(--bp-body);
            }
          `,
        }}
      />

      <main className="blog-post-page" style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px 120px" }}>
        <div className="blog-post-hero">
          {/* Back to blog */}
          <Link
            href="/blog"
            className="blog-back-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              textDecoration: "none",
              marginBottom: 40,
              fontWeight: 500,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to blog
          </Link>

          {/* Hero banner with illustration */}
          <div
            className="blog-hero-banner"
            style={{
              position: "relative",
              borderRadius: 20,
              padding: "40px 36px 36px",
              marginBottom: 40,
              overflow: "hidden",
            }}
          >
            {/* Background illustration */}
            <div
              className="blog-hero-illustration"
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "50%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              <BlogHeroIllustration category={post.category} />
            </div>

            {/* Content */}
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div
                  className="blog-hero-icon"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PostIcon slug={post.slug} category={post.category} size={28} />
                </div>
                <div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#2563EB",
                    }}
                  >
                    {post.category}
                  </span>
                  <div style={{ fontSize: 12, color: "var(--bp-ghost)", marginTop: 2 }}>{post.readingTime}</div>
                </div>
              </div>

              <h1
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: "-0.03em",
                  color: "var(--bp-fg)",
                  marginBottom: 20,
                  maxWidth: "85%",
                }}
              >
                {post.title}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--bp-faint)" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: 500, color: "var(--bp-muted)" }}>{post.author}</span>
                <span style={{ color: "var(--bp-line)" }}>|</span>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Post content */}
        <article className="blog-post-content" style={{ marginBottom: 20 }}>
          <MDXRemote source={post.content} components={mdxComponents} />
        </article>

        {/* Footer */}
        <div className="blog-post-footer">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ marginTop: 48, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="blog-tag"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "6px 16px",
                    borderRadius: 100,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div
            className="blog-cta-section"
            style={{
              marginTop: 64,
              padding: "48px 40px",
              borderRadius: 20,
              background: "linear-gradient(135deg, #1E40AF, #2563EB)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

            {/* Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                position: "relative",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>

            <p style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 8, position: "relative" }}>
              Try SoloPad free for 30 days
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", marginBottom: 28, position: "relative", lineHeight: 1.6 }}>
              Invoices, contracts, proposals, CRM, and AI drafting — starting at £5/mo.
            </p>
            <Link
              href="/signup"
              className="blog-cta-btn"
              style={{
                display: "inline-block",
                background: "white",
                color: "#1E40AF",
                fontWeight: 700,
                fontSize: 15,
                padding: "12px 32px",
                borderRadius: 100,
                textDecoration: "none",
                position: "relative",
              }}
            >
              Start free trial
            </Link>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div style={{ marginTop: 80 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--bp-ghost)", marginBottom: 20 }}>
                Related posts
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {related.map((r) => {
                  const RelatedIcon = getBlogIcon(r.slug, r.category);
                  return (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="blog-related-link"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "18px 20px",
                        borderRadius: 14,
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div
                        className="related-icon-wrap"
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <RelatedIcon size={24} color="#2563EB" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 2, color: "var(--bp-fg-soft)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {r.title}
                        </p>
                        <p style={{ fontSize: 13, color: "var(--bp-ghost)" }}>
                          {r.readingTime} · {r.category}
                        </p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--bp-ghost)" }}>
                        <path d="M6 4l4 4-4 4" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
