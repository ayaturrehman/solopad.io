import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { getBlogIcon, BlogHeroArt, BlogSceneIllustration } from "@/components/blog/BlogIcons";

export const metadata = {
  title: "Blog — Freelance Tips, Guides & Product Updates",
  description:
    "Guides on freelance proposals, contracts, invoicing, pricing, and running your freelance business. Tips from the SoloPad team.",
  alternates: { canonical: "https://www.solopad.io/blog" },
};

function PostIcon({ slug, category, size = 44 }) {
  const Icon = getBlogIcon(slug, category);
  return <Icon size={size} />;
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
              --bp-fg: #0F172A;
              --bp-fg-soft: #1E293B;
              --bp-muted: #64748B;
              --bp-faint: #94A3B8;
              --bp-ghost: #94A3B8;
              --bp-card: #ffffff;
              --bp-card-border: #E2E8F0;
              --bp-surface: #F8FAFC;
              --bp-surface-2: #F1F5F9;
              --bp-blue: #1D4ED8;
              --bp-orange: #F05A37;
              --bp-blue-soft: #EFF6FF;
              --bp-orange-soft: #FFF4F0;
              --bp-accent-border: #BFDBFE;
              --bp-shadow: rgba(15,23,42,0.08);
              --bp-dot: #CBD5E1;
              --bp-divider: #F1F5F9;
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
              --bp-blue-soft: rgba(29,78,216,0.22);
              --bp-orange-soft: rgba(240,90,55,0.16);
              --bp-accent-border: #1e3a5f;
              --bp-shadow: rgba(0,0,0,0.35);
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
            .blog-grid-item:nth-child(6) { animation-delay: 0.5s; }
            .blog-grid-item:nth-child(7) { animation-delay: 0.57s; }

            .blog-card {
              transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
              background: var(--bp-card);
              border: 1px solid var(--bp-card-border);
              color: inherit;
              overflow: hidden;
            }
            .blog-card:hover {
              transform: translateY(-6px);
              box-shadow: 0 18px 40px var(--bp-shadow);
              border-color: #F05A37;
            }
            .blog-card:hover .blog-scene {
              transform: scale(1.04);
            }
            .blog-featured-card {
              transition: transform 0.3s ease, box-shadow 0.3s ease;
              background: var(--bp-card);
              border: 1px solid var(--bp-card-border);
            }
            .blog-featured-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 22px 50px var(--bp-shadow);
            }
            .blog-featured-card:hover .blog-scene {
              transform: scale(1.03);
            }
            .blog-scene {
              transition: transform 0.4s ease;
              transform-origin: center;
            }
            .blog-scene svg {
              width: 100%;
              height: 100%;
              display: block;
            }
            .blog-card-arrow {
              transition: transform 0.25s ease, opacity 0.25s ease, color 0.25s ease;
              opacity: 0;
              transform: translateX(-8px);
            }
            .blog-card:hover .blog-card-arrow,
            .blog-featured-card:hover .blog-card-arrow {
              opacity: 1;
              transform: translateX(0);
              color: var(--bp-orange);
            }
            .blog-cat-pill {
              transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
              cursor: default;
              background: var(--bp-surface-2);
              color: var(--bp-muted);
              border: 1px solid var(--bp-card-border);
            }
            .blog-cat-pill:hover {
              background: var(--bp-orange) !important;
              color: white !important;
              border-color: var(--bp-orange) !important;
            }
            .blog-cta-btn {
              transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            .blog-cta-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 24px rgba(29,78,216,0.28);
            }
            .blog-inline-link {
              color: var(--bp-blue);
              text-decoration: none;
              font-weight: 600;
            }
            .blog-inline-link:hover { color: var(--bp-orange); }
            @media (max-width: 860px) {
              .blog-hero-grid,
              .blog-featured-grid {
                grid-template-columns: 1fr !important;
              }
              .blog-hero-art { order: -1; max-width: 420px; margin: 0 auto; }
            }
            @media (max-width: 640px) {
              .blog-posts-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `,
        }}
      />

      <main className="blog-page" style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px 120px" }}>
        <div
          className="blog-hero blog-hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 48,
            alignItems: "center",
            marginBottom: 72,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 100,
                marginBottom: 20,
                background: "var(--bp-orange-soft)",
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--bp-orange)" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--bp-orange)", letterSpacing: "0.04em" }}>
                SoloPad Blog
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(36px, 5vw, 52px)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.035em",
                marginBottom: 16,
                color: "var(--bp-fg)",
              }}
            >
              Freelance tips, guides{" "}
              <span style={{ color: "var(--bp-blue)" }}>&amp;</span>{" "}
              <span style={{ color: "var(--bp-orange)" }}>comparisons</span>
            </h1>
            <p style={{ fontSize: 18, color: "var(--bp-muted)", lineHeight: 1.6, fontWeight: 400, marginBottom: 20 }}>
              Everything you need to run a better freelance business — proposals,
              contracts, invoicing, and more.
            </p>
            <p style={{ fontSize: 15, color: "var(--bp-faint)", lineHeight: 1.7, fontWeight: 400, marginBottom: 16 }}>
              This is where we write down what actually works for solo freelancers and
              small teams — not theory, but the proposals that won real clients, the
              contract clauses that prevented real disputes, and the invoicing habits
              that got people paid faster. We test freelance management tools like
              HoneyBook, Dubsado, and Bonsai directly against SoloPad so you can see
              honest pricing and feature comparisons before you commit to a platform.
            </p>
            <p style={{ fontSize: 15, color: "var(--bp-faint)", lineHeight: 1.7, fontWeight: 400, marginBottom: 16 }}>
              Browse guides on writing freelance proposals, free contract template
              checklists, invoice examples that get paid faster, AI proposal drafting,
              time tracking software, and cheap alternatives to expensive freelance CRMs.
              Each article is written from real client work — what we kept, what we
              dropped, and what we would tell a friend starting out tomorrow.
            </p>
            <p style={{ fontSize: 15, color: "var(--bp-faint)", lineHeight: 1.7, fontWeight: 400 }}>
              New posts on pricing, client onboarding, scheduling, and freelance
              business operations go up regularly. If you are comparing platforms,
              start with our HoneyBook, Dubsado, and Bonsai comparisons, then dig into
              the how-to guides for the workflows that matter day to day. Prefer a
              product tour first? See{" "}
              <Link href="/features" className="blog-inline-link">
                SoloPad features
              </Link>{" "}
              or{" "}
              <Link href="/compare" className="blog-inline-link">
                compare SoloPad
              </Link>{" "}
              with the tools you already know.
            </p>
          </div>

          <div className="blog-hero-art">
            <BlogHeroArt />
          </div>
        </div>

        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="blog-featured blog-featured-card blog-featured-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 0,
              alignItems: "stretch",
              borderRadius: 24,
              marginBottom: 56,
              textDecoration: "none",
              color: "inherit",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  padding: "5px 12px",
                  borderRadius: 100,
                  marginBottom: 16,
                  background: "var(--bp-orange)",
                  color: "#fff",
                }}
              >
                Featured
              </span>
              <h2 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.25, marginBottom: 12, letterSpacing: "-0.025em", color: "var(--bp-fg)" }}>
                {featured.title}
              </h2>
              <p style={{ fontSize: 15, color: "var(--bp-muted)", lineHeight: 1.65, marginBottom: 22, maxWidth: 520 }}>
                {featured.excerpt}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13, color: "var(--bp-faint)" }}>
                <span
                  style={{
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 100,
                    background: "var(--bp-blue-soft)",
                    color: "var(--bp-blue)",
                  }}
                >
                  {featured.category}
                </span>
                <span>{featured.readingTime}</span>
                <span>{new Date(featured.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="blog-card-arrow" style={{ color: "var(--bp-orange)", marginLeft: "auto" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="blog-scene" style={{ minHeight: 240, background: "var(--bp-blue-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", height: "100%" }}>
                <BlogSceneIllustration slug={featured.slug} category={featured.category} />
              </div>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--bp-faint)", marginRight: 4 }}>Topics:</span>
            {[...new Set(posts.map((p) => p.category))].map((cat) => (
              <span
                key={cat}
                className="blog-cat-pill"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
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
              gap: 22,
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
                  borderRadius: 20,
                  textDecoration: "none",
                }}
              >
                <div className="blog-scene" style={{ height: 148, overflow: "hidden" }}>
                  <BlogSceneIllustration slug={post.slug} category={post.category} />
                </div>

                <div style={{ padding: "22px 22px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <PostIcon slug={post.slug} category={post.category} size={40} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 100,
                        background: post.category === "Comparisons" ? "var(--bp-orange-soft)" : "var(--bp-blue-soft)",
                        color: post.category === "Comparisons" ? "var(--bp-orange)" : "var(--bp-blue)",
                      }}
                    >
                      {post.category}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      lineHeight: 1.35,
                      marginBottom: 10,
                      color: "var(--bp-fg)",
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {post.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--bp-muted)",
                      lineHeight: 1.55,
                      marginBottom: 18,
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
                      paddingTop: 14,
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
                    <span className="blog-card-arrow" style={{ color: "var(--bp-orange)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
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
          style={{
            marginTop: 88,
            padding: "52px 40px",
            borderRadius: 24,
            textAlign: "center",
            background: "linear-gradient(135deg, var(--bp-blue-soft) 0%, var(--bp-orange-soft) 100%)",
            border: "1px solid var(--bp-card-border)",
          }}
        >
          <p style={{ fontSize: 24, fontWeight: 800, color: "var(--bp-fg)", marginBottom: 8, letterSpacing: "-0.025em" }}>
            Run your freelance business smarter
          </p>
          <p style={{ fontSize: 15, color: "var(--bp-muted)", marginBottom: 28, lineHeight: 1.6 }}>
            Proposals, contracts, invoices, CRM, and AI drafting — all in one place. Starting at £5/mo.
          </p>
          <Link
            href="/signup"
            className="blog-cta-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--bp-blue)",
              color: "white",
              fontWeight: 700,
              fontSize: 15,
              padding: "13px 28px",
              borderRadius: 100,
              textDecoration: "none",
            }}
          >
            Try SoloPad free
            <span style={{ color: "#FDBA74" }}>→</span>
          </Link>
        </div>
      </main>
    </>
  );
}
