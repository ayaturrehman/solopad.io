import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { getBlogIcon } from "@/components/blog/BlogIcons";

export const metadata = {
  title: "Blog — Freelance Tips, Guides & Product Updates",
  description:
    "Guides on freelance proposals, contracts, invoicing, pricing, and running your freelance business. Tips from the SoloPad team.",
  alternates: { canonical: "https://www.solopad.io/blog" },
};

function PostIcon({ slug, category, size = 44 }) {
  const Icon = getBlogIcon(slug, category);
  return <Icon size={size} color="#2563EB" />;
}

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => p !== featured);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .blog-page {
              --bp-fg: #111;
              --bp-fg-soft: #222;
              --bp-muted: #666;
              --bp-faint: #999;
              --bp-ghost: #BBB;
              --bp-card: #ffffff;
              --bp-card-border: #F1F5F9;
              --bp-surface: #FAFBFC;
              --bp-surface-2: #F8FAFC;
              --bp-accent-soft: #EFF6FF;
              --bp-accent-border: #DBEAFE;
              --bp-hero-grad: linear-gradient(135deg, #111 0%, #2563EB 100%);
              --bp-featured-bg: linear-gradient(135deg, #EFF6FF 0%, #F8FAFF 100%);
              --bp-shadow: rgba(0,0,0,0.08);
              --bp-featured-shadow: rgba(37,99,235,0.1);
              --bp-dot: #DDD;
              --bp-divider: #F8FAFC;
            }
            html[data-theme="dark"] .blog-page {
              --bp-fg: #f4f4f5;
              --bp-fg-soft: #e4e4e7;
              --bp-muted: #a1a1aa;
              --bp-faint: #71717a;
              --bp-ghost: #71717a;
              --bp-card: #18181b;
              --bp-card-border: #27272a;
              --bp-surface: #111113;
              --bp-surface-2: #18181b;
              --bp-accent-soft: rgba(37,99,235,0.18);
              --bp-accent-border: #1e3a5f;
              --bp-hero-grad: linear-gradient(135deg, #fafafa 0%, #60a5fa 100%);
              --bp-featured-bg: linear-gradient(135deg, #111827 0%, #18181b 100%);
              --bp-shadow: rgba(0,0,0,0.35);
              --bp-featured-shadow: rgba(37,99,235,0.2);
              --bp-dot: #3f3f46;
              --bp-divider: #27272a;
            }

            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(24px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .blog-hero { animation: fadeUp 0.6s ease-out; }
            .blog-featured { animation: fadeUp 0.6s ease-out 0.1s both; }
            .blog-grid-item { animation: fadeUp 0.5s ease-out both; }
            .blog-grid-item:nth-child(1) { animation-delay: 0.15s; }
            .blog-grid-item:nth-child(2) { animation-delay: 0.22s; }
            .blog-grid-item:nth-child(3) { animation-delay: 0.29s; }
            .blog-grid-item:nth-child(4) { animation-delay: 0.36s; }
            .blog-grid-item:nth-child(5) { animation-delay: 0.43s; }

            .blog-card {
              transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
              background: var(--bp-card);
              border: 1px solid var(--bp-card-border);
              color: inherit;
            }
            .blog-card:hover {
              transform: translateY(-6px);
              box-shadow: 0 16px 48px var(--bp-shadow);
              border-color: var(--bp-accent-border) !important;
            }
            .blog-card:hover .blog-card-icon-wrap {
              background: var(--bp-accent-soft) !important;
              transform: scale(1.05);
            }
            .blog-featured-card {
              transition: transform 0.3s ease, box-shadow 0.3s ease;
              background: var(--bp-featured-bg);
              border: 1px solid var(--bp-accent-border);
            }
            .blog-featured-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 20px 60px var(--bp-featured-shadow);
            }
            .blog-featured-card:hover .featured-icon-wrap {
              transform: scale(1.08);
            }
            .blog-card-arrow {
              transition: transform 0.25s ease, opacity 0.25s ease;
              opacity: 0;
              transform: translateX(-8px);
            }
            .blog-card:hover .blog-card-arrow,
            .blog-featured-card:hover .blog-card-arrow {
              opacity: 1;
              transform: translateX(0);
            }
            .blog-card-icon-wrap {
              transition: background 0.25s ease, transform 0.25s ease;
              background: var(--bp-surface-2);
            }
            .featured-icon-wrap {
              transition: transform 0.3s ease;
              background: var(--bp-card);
              border: 1px solid var(--bp-accent-border);
            }
            .blog-cat-pill {
              transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
              cursor: default;
              background: var(--bp-surface-2);
              color: var(--bp-muted);
              border: 1px solid var(--bp-card-border);
            }
            .blog-cat-pill:hover {
              background: #2563EB !important;
              color: white !important;
              border-color: #2563EB !important;
            }
            .blog-cta-btn {
              transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            .blog-cta-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(37,99,235,0.25);
            }
            .blog-gradient-text {
              background: var(--bp-hero-grad);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .blog-eyebrow {
              background: var(--bp-accent-soft);
            }
            .blog-featured-badge {
              background: var(--bp-card);
              border: 1px solid var(--bp-accent-border);
              color: #2563EB;
            }
            .blog-meta-pill {
              background: var(--bp-accent-soft);
              color: #2563EB;
            }
            .blog-cta-box {
              background: var(--bp-surface);
              border: 1px solid var(--bp-card-border);
            }
            @media (max-width: 640px) {
              .blog-posts-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `,
        }}
      />

      <main className="blog-page" style={{ maxWidth: 1080, margin: "0 auto", padding: "60px 24px 120px" }}>
        <div className="blog-hero" style={{ marginBottom: 64, maxWidth: 640 }}>
          <div
            className="blog-eyebrow"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 100,
              marginBottom: 20,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", letterSpacing: "0.02em" }}>
              SoloPad Blog
            </span>
          </div>

          <h1
            className="blog-gradient-text"
            style={{
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            Freelance tips, guides &amp; comparisons
          </h1>
          <p style={{ fontSize: 17, color: "var(--bp-muted)", lineHeight: 1.6, fontWeight: 400 }}>
            Everything you need to run a better freelance business — proposals,
            contracts, invoicing, and more.
          </p>
        </div>

        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="blog-featured blog-featured-card"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 32,
              alignItems: "center",
              padding: "40px 40px",
              borderRadius: 20,
              marginBottom: 56,
              textDecoration: "none",
              color: "inherit",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -80, right: -80, width: 240, height: 240, borderRadius: "50%", background: "rgba(37,99,235,0.04)" }} />

            <div style={{ position: "relative" }}>
              <span
                className="blog-featured-badge"
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "4px 12px",
                  borderRadius: 100,
                  marginBottom: 16,
                }}
              >
                Featured
              </span>
              <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginBottom: 12, letterSpacing: "-0.02em", color: "var(--bp-fg)" }}>
                {featured.title}
              </h2>
              <p style={{ fontSize: 15, color: "var(--bp-muted)", lineHeight: 1.6, marginBottom: 20, maxWidth: 520 }}>
                {featured.excerpt}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "var(--bp-faint)" }}>
                <span className="blog-meta-pill" style={{ fontWeight: 500, padding: "2px 10px", borderRadius: 100 }}>
                  {featured.category}
                </span>
                <span>{featured.readingTime}</span>
                <span>{new Date(featured.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>

            <div
              className="featured-icon-wrap"
              style={{
                width: 100,
                height: 100,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PostIcon slug={featured.slug} category={featured.category} size={52} />
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bp-faint)", marginRight: 4 }}>Topics:</span>
            {[...new Set(posts.map((p) => p.category))].map((cat) => (
              <span
                key={cat}
                className="blog-cat-pill"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "5px 16px",
                  borderRadius: 100,
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div
            className="blog-posts-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="blog-grid-item blog-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "28px",
                  borderRadius: 16,
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div
                    className="blog-card-icon-wrap"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PostIcon slug={post.slug} category={post.category} size={32} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      className="blog-meta-pill"
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 100,
                      }}
                    >
                      {post.category}
                    </span>
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    marginBottom: 10,
                    color: "var(--bp-fg)",
                    letterSpacing: "-0.01em",
                    flex: 1,
                  }}
                >
                  {post.title}
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    color: "var(--bp-muted)",
                    lineHeight: 1.55,
                    marginBottom: 20,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {post.excerpt}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--bp-divider)",
                    paddingTop: 16,
                    marginTop: "auto",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--bp-ghost)" }}>
                    <span>{post.readingTime}</span>
                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--bp-dot)", display: "inline-block" }} />
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="blog-card-arrow" style={{ color: "#2563EB" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <p style={{ fontSize: 17, color: "var(--bp-faint)" }}>No posts yet. Check back soon.</p>
          </div>
        )}

        <div
          className="blog-cta-box"
          style={{
            marginTop: 80,
            padding: "48px 40px",
            borderRadius: 20,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--bp-fg)", marginBottom: 8, letterSpacing: "-0.02em" }}>
            Run your freelance business smarter
          </p>
          <p style={{ fontSize: 15, color: "var(--bp-muted)", marginBottom: 28, lineHeight: 1.6 }}>
            Proposals, contracts, invoices, CRM, and AI drafting — all in one place. Starting at £5/mo.
          </p>
          <Link
            href="/signup"
            className="blog-cta-btn"
            style={{
              display: "inline-block",
              background: "#2563EB",
              color: "white",
              fontWeight: 600,
              fontSize: 15,
              padding: "12px 28px",
              borderRadius: 100,
              textDecoration: "none",
            }}
          >
            Try SoloPad free
          </Link>
        </div>
      </main>
    </>
  );
}
