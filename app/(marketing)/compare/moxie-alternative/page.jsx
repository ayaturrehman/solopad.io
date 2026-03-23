'use client';

export const metadata = {
  title: 'Moxie Alternative for Freelancers | SoloPad',
  description: 'Compare SoloPad to Moxie. We offer all the features you need at £5/mo including AI drafting, contracts, proposals, invoicing, CRM, time tracking, and more.',
  canonical: 'https://solopad.io/compare/moxie-alternative',
  openGraph: {
    title: 'Moxie Alternative for Freelancers | SoloPad',
    description: 'Compare SoloPad to Moxie. Better pricing, AI drafting, and simpler setup.',
    url: 'https://solopad.io/compare/moxie-alternative',
    type: 'article',
    images: [
      {
        url: 'https://solopad.io/og-moxie-comparison.jpg',
        width: 1200,
        height: 630,
        alt: 'SoloPad vs Moxie Comparison',
      },
    ],
  },
};

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12L5 9M5 9L2 12M5 9L18 2" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12L5 9M5 9L2 12M5 9L18 2" fill="none" stroke="#2563EB" strokeWidth="2"/>
    <circle cx="10" cy="10" r="8" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.3"/>
  </svg>
);

const CrossIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4L16 16M16 4L4 16" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="10" cy="10" r="8" fill="none" stroke="#ddd" strokeWidth="1.5"/>
  </svg>
);

const ProIcon = () => (
  <span style={{ fontSize: '11px', fontWeight: '600', color: '#666', backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: '3px' }}>
    Pro
  </span>
);

export default function MoxieAlternativePage() {
  return (
    <div style={{ fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-up {
          animation: fadeUp 0.6s ease-out forwards;
        }
        
        .fade-up-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .fade-up-delay-2 { animation-delay: 0.2s; opacity: 0; }
        .fade-up-delay-3 { animation-delay: 0.3s; opacity: 0; }
        
        .gradient-bg {
          background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
        }
      `}} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Article",
            "headline": "Moxie Alternative for Freelancers",
            "description": "Compare SoloPad to Moxie. Better pricing, AI drafting, and all features on one plan.",
            "image": "https://solopad.io/og-moxie-comparison.jpg",
            "datePublished": "2026-03-23",
            "dateModified": "2026-03-23",
            "author": {
              "@type": "Organization",
              "name": "SoloPad",
              "url": "https://solopad.io"
            },
            "publisher": {
              "@type": "Organization",
              "name": "SoloPad",
              "logo": {
                "@type": "ImageObject",
                "url": "https://solopad.io/logo.png"
              }
            }
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://solopad.io"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Compare",
                "item": "https://solopad.io/compare"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Moxie Alternative",
                "item": "https://solopad.io/compare/moxie-alternative"
              }
            ]
          },
          {
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is SoloPad cheaper than Moxie?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. SoloPad is £5/mo for all features. Moxie's Starter is $12/mo but limited. Their Pro plan is $25/mo for full features. SoloPad is significantly cheaper and includes AI drafting."
                }
              },
              {
                "@type": "Question",
                "name": "Does SoloPad have AI drafting like ChatGPT?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. SoloPad includes built-in AI drafting to help you write proposals, contracts, and other documents quickly. Moxie does not have this feature."
                }
              },
              {
                "@type": "Question",
                "name": "Can I track expenses and generate profit/loss reports with SoloPad?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "SoloPad doesn't currently include expense tracking or profit/loss reporting. Moxie offers these features. If you need advanced financial reporting, Moxie is the better choice."
                }
              },
              {
                "@type": "Question",
                "name": "Does SoloPad have a client portal?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. SoloPad includes a client portal so your clients can view invoices, contracts, and proposals without needing a login."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use SoloPad for time tracking?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. SoloPad includes time tracking so you can log hours and see how much time you spend on each client."
                }
              }
            ]
          }
        ]
      })}} />

      {/* Hero Section */}
      <section className="gradient-bg" style={{ color: 'white', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '30px', fontSize: '14px', opacity: 0.9 }}>
            <a href="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Home</a>
            {' / '}
            <a href="/compare" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Compare</a>
            {' / '}
            <span>Moxie Alternative</span>
          </div>

          {/* Main Heading */}
          <h1 className="fade-up fade-up-delay-1" style={{ fontSize: '48px', fontWeight: '700', margin: '0 0 20px 0', lineHeight: '1.2' }}>
            Moxie Alternative for Freelancers
          </h1>
          
          <p className="fade-up fade-up-delay-2" style={{ fontSize: '20px', margin: '0', opacity: 0.95, maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
            SoloPad gives you everything Moxie offers, plus AI drafting, at a fraction of the cost.
          </p>
        </div>
      </section>

      {/* Why Freelancers Switch Section */}
      <section style={{ padding: '60px 20px', backgroundColor: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111', marginBottom: '40px', textAlign: 'center' }}>
            Why Freelancers Switch from Moxie
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[
              {
                title: 'Limited Starter Plan',
                description: 'Moxie\'s Starter plan ($12/mo) is missing core features. You need Pro at $25/mo to unlock invoicing automation and other essentials.'
              },
              {
                title: 'Expensive Pro Plan',
                description: 'Paying $25/mo adds up. SoloPad costs £5/mo with everything included. That\'s 5x cheaper for more features.'
              },
              {
                title: 'No AI Drafting',
                description: 'Moxie doesn\'t have AI to help you draft proposals and contracts. SoloPad does. Save hours per month writing from scratch.'
              },
              {
                title: 'Proposal Workflow Feels Secondary',
                description: 'Moxie is invoice-first. SoloPad treats proposals as a first-class feature. Easier to manage your sales pipeline.'
              }
            ].map((item, idx) => (
              <div key={idx} className="fade-up" style={{ opacity: 0, animationDelay: `${idx * 0.1}s`, backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111', marginBottom: '10px', textAlign: 'center' }}>
            Feature Comparison
          </h2>
          <p style={{ fontSize: '16px', color: '#666', textAlign: 'center', marginBottom: '40px' }}>
            Head-to-head breakdown of what each tool includes.
          </p>

          <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#111' }}>Feature</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#111' }}>SoloPad</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#111' }}>Moxie</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Invoicing', solopad: true, moxie: true, moxieNote: null },
                  { feature: 'Contracts', solopad: true, moxie: true, moxieNote: null },
                  { feature: 'Proposals', solopad: true, moxie: true, moxieNote: null },
                  { feature: 'CRM', solopad: true, moxie: true, moxieNote: null },
                  { feature: 'Time Tracking', solopad: true, moxie: true, moxieNote: null },
                  { feature: 'Scheduling', solopad: true, moxie: true, moxieNote: null },
                  { feature: 'Client Portal', solopad: true, moxie: true, moxieNote: null },
                  { feature: 'AI Drafting', solopad: true, moxie: false, moxieNote: null },
                  { feature: 'Expense Tracking', solopad: false, moxie: true, moxieNote: null },
                  { feature: 'Profit/Loss Reports', solopad: false, moxie: true, moxieNote: null },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px', fontWeight: '500', color: '#111' }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {row.solopad ? <CheckIcon /> : <CrossIcon />}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {row.moxie ? <CheckIcon /> : <CrossIcon />}
                      {row.moxieNote && <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{row.moxieNote}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section style={{ padding: '60px 20px', backgroundColor: '#EFF6FF', borderTop: '1px solid #DBEAFE', borderBottom: '1px solid #DBEAFE' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111', marginBottom: '40px', textAlign: 'center' }}>
            Pricing Comparison
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {/* SoloPad Pricing */}
            <div className="fade-up fade-up-delay-1" style={{ opacity: 0, backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '2px solid #2563EB', textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: '0 0 10px 0' }}>
                SoloPad
              </h3>
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 30px 0' }}>
                All features included
              </p>
              <div style={{ marginBottom: '30px' }}>
                <span style={{ fontSize: '48px', fontWeight: '700', color: '#2563EB' }}>
                  £5
                </span>
                <span style={{ fontSize: '16px', color: '#666', marginLeft: '8px' }}>
                  /month
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0 0 30px 0', textAlign: 'left', fontSize: '14px' }}>
                {['All features on one plan', 'No plan upgrades needed', 'AI drafting included', 'Client portal', 'Time tracking', 'Invoicing, contracts, proposals'].map((feature, i) => (
                  <li key={i} style={{ padding: '8px 0', color: '#666', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ marginRight: '8px' }}>✓</span> {feature}
                  </li>
                ))}
              </ul>
              <a href="/signup" style={{ display: 'block', backgroundColor: '#2563EB', color: 'white', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>
                Start Free Trial
              </a>
            </div>

            {/* Moxie Pricing */}
            <div className="fade-up fade-up-delay-2" style={{ opacity: 0, backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: '0 0 10px 0' }}>
                Moxie Pro
              </h3>
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 30px 0' }}>
                You need Pro for full features
              </p>
              <div style={{ marginBottom: '30px' }}>
                <span style={{ fontSize: '48px', fontWeight: '700', color: '#111' }}>
                  $25
                </span>
                <span style={{ fontSize: '16px', color: '#666', marginLeft: '8px' }}>
                  /month ($20 annually)
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0 0 30px 0', textAlign: 'left', fontSize: '14px' }}>
                {['Most core features', 'Expense tracking', 'Profit/loss reporting', 'Invoicing', 'Time tracking', 'Requires upgrade from Starter'].map((feature, i) => (
                  <li key={i} style={{ padding: '8px 0', color: '#666', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ marginRight: '8px' }}>✓</span> {feature}
                  </li>
                ))}
              </ul>
              <a href="https://moxie.app" target="_blank" rel="noopener noreferrer" style={{ display: 'block', backgroundColor: '#F1F5F9', color: '#111', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>
                Visit Moxie
              </a>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginTop: '40px' }}>
            SoloPad is £5/mo. Moxie Pro is $25/mo. At current exchange rates, SoloPad is roughly 5x cheaper. Plus you get AI drafting.
          </p>
        </div>
      </section>

      {/* What Moxie Does Better */}
      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111', marginBottom: '40px', textAlign: 'center' }}>
            What Moxie Does Better
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {[
              {
                title: 'Expense Tracking',
                description: 'Moxie lets you log and categorize expenses. Useful if you need to track spending for tax deductions.'
              },
              {
                title: 'Profit/Loss Reports',
                description: 'Moxie generates detailed P&L reports with charts and insights. Great for understanding your profitability.'
              },
              {
                title: 'Financial Analytics',
                description: 'Moxie has more advanced reporting and dashboards for financial data. Better if analytics are critical to your business.'
              },
              {
                title: 'Established Reputation',
                description: 'Moxie was formerly known as Hectic. It\'s been around longer and has a large user base. Proven and stable.'
              }
            ].map((item, idx) => (
              <div key={idx} className="fade-up" style={{ opacity: 0, animationDelay: `${idx * 0.1}s`, backgroundColor: '#F8FAFC', padding: '30px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What SoloPad Does Better */}
      <section style={{ padding: '60px 20px', backgroundColor: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111', marginBottom: '40px', textAlign: 'center' }}>
            What SoloPad Does Better
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {[
              {
                title: 'AI Drafting',
                description: 'SoloPad includes built-in AI to draft proposals, contracts, and other documents. Write in seconds instead of minutes.'
              },
              {
                title: 'Price',
                description: 'At £5/mo, SoloPad is dramatically cheaper than Moxie Pro. No hidden costs or feature lockouts on lower tiers.'
              },
              {
                title: 'Simplicity',
                description: 'All features are on one plan. No confusion about what\'s included. Log in and use everything on day one.'
              },
              {
                title: 'User Interface',
                description: 'SoloPad\'s interface is cleaner and more intuitive. Less clicking, faster workflows.'
              }
            ].map((item, idx) => (
              <div key={idx} className="fade-up" style={{ opacity: 0, animationDelay: `${idx * 0.1}s`, backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '60px 20px', backgroundColor: 'white', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111', marginBottom: '40px', textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'grid', gap: '20px' }}>
            {[
              {
                q: 'Is SoloPad cheaper than Moxie?',
                a: 'Yes. SoloPad is £5/mo for all features. Moxie\'s Starter is $12/mo but limited to basic invoicing. Moxie Pro is $25/mo. SoloPad is significantly cheaper and includes AI drafting.'
              },
              {
                q: 'Does SoloPad have AI drafting?',
                a: 'Yes. SoloPad includes built-in AI drafting to help you write proposals, contracts, and other documents quickly. Moxie does not have this feature.'
              },
              {
                q: 'Can I track expenses with SoloPad?',
                a: 'Not yet. SoloPad doesn\'t include expense tracking or profit/loss reporting. Moxie offers these. If advanced financial tracking is critical, Moxie is the better choice.'
              },
              {
                q: 'Does SoloPad have a client portal?',
                a: 'Yes. SoloPad includes a client portal so your clients can view invoices, contracts, and proposals without logging in.'
              },
              {
                q: 'Can I switch from Moxie to SoloPad easily?',
                a: 'Yes. Most of your data (invoices, clients, projects) can be exported from Moxie and imported into SoloPad. We support CSV imports for faster migration.'
              }
            ].map((item, idx) => (
              <details key={idx} style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9', cursor: 'pointer' }}>
                <summary style={{ fontWeight: '600', color: '#111', fontSize: '16px', outline: 'none' }}>
                  {item.q}
                </summary>
                <p style={{ color: '#666', marginTop: '12px', marginBottom: '0', lineHeight: '1.6', fontSize: '14px' }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg" style={{ padding: '60px 20px', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', margin: '0 0 20px 0' }}>
            Ready to Switch?
          </h2>
          <p style={{ fontSize: '18px', margin: '0 0 40px 0', opacity: 0.95 }}>
            Try SoloPad free for 14 days. No credit card required.
          </p>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/signup" style={{ backgroundColor: 'white', color: '#2563EB', padding: '14px 32px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '16px' }}>
              Start Free Trial
            </a>
            <a href="https://calendar.app.google.com/calendar/u/0/r" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '14px 32px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '16px', border: '1px solid rgba(255,255,255,0.4)' }}>
              Book a Demo
            </a>
          </div>

          <p style={{ fontSize: '14px', marginTop: '30px', opacity: 0.85 }}>
            No credit card. No spam. Just streamlined freelance management.
          </p>
        </div>
      </section>

      {/* Footer Note */}
      <section style={{ padding: '40px 20px', backgroundColor: '#F8FAFC', textAlign: 'center', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>
            This comparison is accurate as of March 2026. Prices and features subject to change. We actively update this page.
          </p>
        </div>
      </section>
    </div>
  );
}