"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogSceneIllustration } from "@/components/blog/BlogIcons";

function Cover({ post, featured = false }) {
  const label = featured
    ? `Cover image for featured article: ${post.title}`
    : `Cover image for ${post.title}`;

  return (
    <div className={`bl-cover${post.image ? "" : " bl-cover-dark"}`}>
      {post.image ? (
        <Image
          src={post.image}
          alt={label}
          fill
          sizes={featured ? "(max-width: 900px) 100vw, 52vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          style={{ objectFit: "cover" }}
          priority={featured}
        />
      ) : (
        <div className="bl-cover-art" role="img" aria-label={label}>
          <BlogSceneIllustration slug={post.slug} category={post.category} />
        </div>
      )}
    </div>
  );
}

export default function BlogListing({ posts }) {
  const [category, setCategory] = useState("All");
  const tabRefs = useRef([]);

  const categories = useMemo(() => {
    const unique = [...new Set(posts.map((p) => p.category))].sort();
    return ["All", ...unique];
  }, [posts]);

  const filtered = useMemo(() => {
    if (category === "All") return posts;
    return posts.filter((p) => p.category === category);
  }, [posts, category]);

  const featured = filtered[0] || null;
  const rest = filtered.slice(1);
  const latest = posts[0] || null;

  function moveTab(fromIndex, key) {
    const last = categories.length - 1;
    let next = fromIndex;
    if (key === "ArrowRight" || key === "ArrowDown") next = fromIndex === last ? 0 : fromIndex + 1;
    else if (key === "ArrowLeft" || key === "ArrowUp") next = fromIndex === 0 ? last : fromIndex - 1;
    else if (key === "Home") next = 0;
    else if (key === "End") next = last;
    else return false;
    setCategory(categories[next]);
    requestAnimationFrame(() => tabRefs.current[next]?.focus());
    return true;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <main className="bl-page">
        <section className="bl-hero-band" aria-labelledby="blog-heading">
          <div className="bl-shell bl-hero">
            <div className="bl-hero-copy">
              <p className="bl-eyebrow">Freelance business blog</p>
              <h1 id="blog-heading">Clear advice for the work that gets you paid.</h1>
              <p className="bl-lede">
                Practical guides on proposals, contracts, invoicing, and freelance tools — written from real client work, not theory.
              </p>
            </div>

            {latest && (
              <aside className="bl-latest" aria-label="Latest article">
                <p className="bl-latest-kicker">Latest article</p>
                <p className="bl-latest-meta">
                  {latest.category} · {latest.publishedLabel}
                </p>
                <p className="bl-latest-title">{latest.title}</p>
                <Link href={`/blog/${latest.slug}`} className="bl-latest-link">
                  Read the latest article
                  <span aria-hidden="true"> →</span>
                </Link>
              </aside>
            )}
          </div>
        </section>

        <div className="bl-shell">
          <section className="bl-trust" aria-labelledby="trust-heading">
            <h2 id="trust-heading" className="bl-kicker">
              Freelance guidance you can actually use
            </h2>
            <p className="bl-trust-intro">
              Every article is meant to be used the same week you read it: a clause to add, a rate to check, or a tool comparison
              that shows what you actually get on the cheapest paid plan.
            </p>
            <div className="bl-trust-grid">
              <article>
                <h3>What you will learn</h3>
                <p>
                  How to write proposals that get replies, what belongs in a freelance contract, how to invoice so you get paid
                  faster, and which management tools are worth the monthly fee.
                </p>
              </article>
              <article>
                <h3>Who it is for</h3>
                <p>
                  Independent designers, developers, writers, and consultants — plus small studios — who want one clear workflow
                  instead of five overlapping subscriptions.
                </p>
              </article>
              <article>
                <h3>How we keep it current</h3>
                <p>
                  We test tools against live freelance work, compare published pricing, and update guides when plans change. Dates
                  on each article show when it was published.
                </p>
              </article>
            </div>
          </section>

          <section className="bl-index" aria-labelledby="articles-heading">
            <div className="bl-index-head">
              <h2 id="articles-heading">Explore by topic</h2>
              <p className="bl-index-count">
                {filtered.length} {filtered.length === 1 ? "article" : "articles"}
                {category !== "All" ? ` in ${category}` : ""}
              </p>
            </div>

            <div className="bl-filters" role="tablist" aria-label="Filter articles by topic">
              {categories.map((cat, index) => {
                const selected = category === cat;
                return (
                  <button
                    key={cat}
                    id={`blog-filter-${index}`}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-current={selected ? "true" : undefined}
                    aria-controls="blog-article-panel"
                    tabIndex={selected ? 0 : -1}
                    className={selected ? "is-active" : undefined}
                    onClick={() => setCategory(cat)}
                    onKeyDown={(e) => {
                      if (moveTab(index, e.key)) e.preventDefault();
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div id="blog-article-panel" role="tabpanel" aria-labelledby={`blog-filter-${categories.indexOf(category)}`}>
              {featured ? (
                <article className="bl-featured">
                  <div className="bl-featured-media">
                    <Cover post={featured} featured />
                  </div>
                  <div className="bl-featured-body">
                    <p className="bl-meta">
                      <span>{featured.category}</span>
                      <span aria-hidden="true">·</span>
                      <time dateTime={featured.publishedAt}>Published {featured.publishedLabel}</time>
                    </p>
                    <h3>
                      <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
                    </h3>
                    <p className="bl-excerpt">{featured.excerpt}</p>
                    <Link href={`/blog/${featured.slug}`} className="bl-read">
                      Read article
                      <span aria-hidden="true"> →</span>
                    </Link>
                  </div>
                </article>
              ) : (
                <p className="bl-empty">No articles in this topic yet.</p>
              )}

              {rest.length > 0 && (
                <ul className="bl-grid">
                  {rest.map((post) => (
                    <li key={post.slug}>
                      <article className="bl-card">
                        <div className="bl-card-media">
                          <Cover post={post} />
                        </div>
                        <div className="bl-card-body">
                          <p className="bl-meta">
                            <span>{post.category}</span>
                            <span aria-hidden="true">·</span>
                            <time dateTime={post.publishedAt}>{post.publishedLabel}</time>
                          </p>
                          <h3>
                            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                          </h3>
                          <p className="bl-excerpt">{post.excerpt}</p>
                          <Link href={`/blog/${post.slug}`} className="bl-read">
                            Read article
                            <span aria-hidden="true"> →</span>
                          </Link>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <section className="bl-cta-band" aria-labelledby="cta-heading">
          <div className="bl-shell bl-cta">
            <h2 id="cta-heading">Need a calmer way to run the business?</h2>
            <p>
              SoloPad brings proposals, contracts, invoices, CRM, and time tracking into one workspace — from £5/mo, with a 30-day
              free trial.
            </p>
            <div className="bl-cta-actions">
              <Link href="/signup" className="bl-cta-primary">
                Start free trial
              </Link>
              <Link href="/features" className="bl-cta-secondary">
                See how SoloPad works
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const styles = `
  .bl-page {
    --ink: #111111;
    --muted: #5B616B;
    --faint: #8A9099;
    --line: #E6E8EC;
    --paper: #FFFFFF;
    --navy: #141B24;
    --navy-2: #1C2530;
    --blue: #1D4ED8;
    --orange: #F05A37;
    --radius: 8px;
    color: var(--ink);
    background: var(--paper);
  }

  .bl-shell {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .bl-hero-band {
    background: var(--navy);
    color: #fff;
    padding: 72px 0 64px;
  }
  .bl-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.72fr);
    gap: 48px 56px;
    align-items: end;
  }
  .bl-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #F05A37;
    margin: 0 0 18px;
  }
  .bl-hero h1 {
    font-size: clamp(34px, 4.6vw, 52px);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.08;
    margin: 0 0 18px;
    max-width: 16ch;
    color: #fff;
  }
  .bl-lede {
    font-size: 17px;
    line-height: 1.65;
    color: rgba(255,255,255,0.72);
    max-width: 38em;
    margin: 0;
  }

  .bl-latest {
    background: var(--navy-2);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    padding: 28px;
    border-radius: var(--radius);
    min-height: 230px;
    display: flex;
    flex-direction: column;
  }
  .bl-latest-kicker {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #F05A37;
    margin: 0 0 16px;
  }
  .bl-latest-meta {
    font-size: 13px;
    color: rgba(255,255,255,0.55);
    margin: 0 0 10px;
  }
  .bl-latest-title {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.02em;
    margin: 0 0 auto;
  }
  .bl-latest-link {
    display: inline-flex;
    margin-top: 22px;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    border-bottom: 1px solid rgba(255,255,255,0.3);
    padding-bottom: 2px;
    width: fit-content;
  }
  .bl-latest-link:hover { border-bottom-color: #F05A37; color: #fff; }

  .bl-latest-link:focus-visible,
  .bl-read:focus-visible,
  .bl-filters button:focus-visible,
  .bl-cta-primary:focus-visible,
  .bl-cta-secondary:focus-visible,
  .bl-featured-body h3 a:focus-visible,
  .bl-card-body h3 a:focus-visible {
    outline: 2px solid #F05A37;
    outline-offset: 3px;
  }

  .bl-trust { padding: 64px 0 8px; }
  .bl-kicker {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--faint);
    margin: 0 0 14px;
  }
  .bl-trust-intro {
    font-size: 22px;
    line-height: 1.45;
    color: var(--ink);
    max-width: 22em;
    margin: 0 0 40px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .bl-trust-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 32px 40px;
  }
  .bl-trust-grid article {
    padding-top: 16px;
    border-top: 1px solid var(--line);
  }
  .bl-trust-grid h3 {
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 10px;
  }
  .bl-trust-grid p {
    font-size: 14px;
    line-height: 1.65;
    color: var(--muted);
    margin: 0;
  }

  .bl-index { padding: 48px 0 80px; }
  .bl-index-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }
  .bl-index-head h2 {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--faint);
    margin: 0;
  }
  .bl-index-count {
    font-size: 13px;
    color: var(--faint);
    margin: 0;
  }

  .bl-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 36px;
  }
  .bl-filters button {
    appearance: none;
    background: #fff;
    border: 1px solid var(--line);
    color: var(--muted);
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: 999px;
    cursor: pointer;
  }
  .bl-filters button:hover { color: var(--ink); border-color: #C9CED6; }
  .bl-filters button.is-active {
    background: var(--navy);
    border-color: var(--navy);
    color: #fff;
  }

  .bl-featured {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 40px;
    align-items: center;
    padding: 0 0 40px;
    margin-bottom: 36px;
    border-bottom: 1px solid var(--line);
  }
  .bl-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: var(--radius);
    background: #1C2530;
  }
  .bl-cover-dark { background: #1C2530; }
  .bl-cover-art,
  .bl-cover-art svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  .bl-featured-body h3,
  .bl-card-body h3 {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 1.25;
    margin: 0 0 12px;
  }
  .bl-card-body h3 { font-size: 18px; }
  .bl-featured-body h3 a,
  .bl-card-body h3 a {
    color: inherit;
    text-decoration: none;
  }
  .bl-featured-body h3 a:hover,
  .bl-card-body h3 a:hover { color: var(--blue); }
  .bl-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--faint);
    margin: 0 0 10px;
  }
  .bl-excerpt {
    font-size: 15px;
    line-height: 1.65;
    color: var(--muted);
    margin: 0 0 18px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .bl-card .bl-excerpt { -webkit-line-clamp: 2; }
  .bl-read {
    font-size: 14px;
    font-weight: 700;
    color: var(--navy);
    text-decoration: none;
  }
  .bl-read:hover { color: var(--orange); }

  .bl-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
  }
  .bl-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    overflow: hidden;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .bl-card:hover {
    border-color: #C9CED6;
    box-shadow: 0 8px 24px rgba(20,27,36,0.06);
  }
  .bl-card .bl-cover { border-radius: 0; }
  .bl-card-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 18px 18px 20px;
  }
  .bl-card-body .bl-read { margin-top: auto; }
  .bl-empty { color: var(--muted); padding: 32px 0; }

  .bl-cta-band {
    background: var(--navy);
    color: #fff;
    padding: 64px 0;
  }
  .bl-cta { max-width: 640px; }
  .bl-cta h2 {
    font-size: clamp(26px, 3vw, 34px);
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0 0 12px;
    color: #fff;
  }
  .bl-cta p {
    font-size: 16px;
    line-height: 1.65;
    color: rgba(255,255,255,0.7);
    margin: 0 0 24px;
  }
  .bl-cta-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 18px;
    align-items: center;
  }
  .bl-cta-primary {
    display: inline-flex;
    background: #fff;
    color: var(--navy);
    font-weight: 700;
    font-size: 15px;
    text-decoration: none;
    padding: 12px 20px;
    border-radius: 6px;
  }
  .bl-cta-primary:hover { background: #F3F4F6; }
  .bl-cta-secondary {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    text-decoration: none;
    border-bottom: 1px solid rgba(255,255,255,0.3);
    padding-bottom: 2px;
  }
  .bl-cta-secondary:hover { border-bottom-color: #F05A37; }

  @media (max-width: 1024px) {
    .bl-trust-grid { grid-template-columns: 1fr 1fr; }
    .bl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 900px) {
    .bl-hero,
    .bl-featured { grid-template-columns: 1fr; }
    .bl-hero { gap: 28px; }
    .bl-hero h1 { max-width: none; }
    .bl-hero-band { padding: 48px 0 40px; }
  }
  @media (max-width: 640px) {
    .bl-shell { padding: 0 20px; }
    .bl-trust-grid,
    .bl-grid { grid-template-columns: 1fr; }
    .bl-index-head { flex-direction: column; gap: 6px; }
    .bl-featured-body h3 { font-size: 22px; }
    .bl-trust-intro { font-size: 20px; }
  }
`;
