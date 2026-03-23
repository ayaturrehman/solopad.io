export const metadata = {
  title: 'Bonsai Alternative for Freelancers | SoloPad',
  description: 'Compare Bonsai vs SoloPad. See why 2000+ freelancers switched. All features for £5/mo vs Bonsai\'s expensive per-user pricing and limited Basic plan.',
  canonical: 'https://solopad.io/compare/bonsai-alternative',
  openGraph: {
    title: 'Bonsai Alternative for Freelancers | SoloPad',
    description: 'Compare Bonsai vs SoloPad. See why freelancers switch to the £5/mo all-in-one platform.',
    url: 'https://solopad.io/compare/bonsai-alternative',
    siteName: 'SoloPad',
    type: 'article',
    images: [
      {
        url: 'https://solopad.io/og-bonsai-comparison.png',
        width: 1200,
        height: 630,
        alt: 'Bonsai vs SoloPad Comparison',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'Bonsai Alternative for Freelancers: Complete Comparison',
      description: 'Compare Bonsai vs SoloPad for freelance management. See pricing, features, and why freelancers are switching.',
      datePublished: '2026-03-23',
      dateModified: '2026-03-23',
      author: {
        '@type': 'Organization',
        name: 'SoloPad',
      },
      publisher: {
        '@type': 'Organization',
        name: 'SoloPad',
        logo: {
          '@type': 'ImageObject',
          url: 'https://solopad.io/logo.svg',
          width: 250,
          height: 60,
        },
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://solopad.io',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Compare',
          item: 'https://solopad.io/compare',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Bonsai Alternative',
          item: 'https://solopad.io/compare/bonsai-alternative',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Why is Bonsai Basic so limited?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Bonsai Basic ($15/mo) excludes invoicing, contracts, and proposals—the three core tools freelancers need. You must pay $25/mo for Essentials to access these features.',
          },
        },
        {
          '@type': 'Question',
          name: 'What happens with Bonsai\'s acquisition in 2026?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Bonsai is being acquired in late 2026. This creates uncertainty around pricing, feature availability, and platform support. SoloPad provides long-term stability as an independent platform.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does SoloPad cost vs Bonsai?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SoloPad costs £5/mo for the Solo plan with all core features. Bonsai costs $25/mo minimum for Essentials (the cheapest plan with invoicing). That\'s 5x cheaper for more features.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use Bonsai for team invoicing?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Bonsai uses per-user pricing, so adding team members costs $15-59/month per person. SoloPad\'s £5/mo flat rate covers unlimited features for your entire team.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does SoloPad have tax preparation like Bonsai?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SoloPad focuses on client-facing tools (invoices, contracts, proposals, CRM). For tax prep, we recommend integrating with specialized platforms. Bonsai has built-in tax tools if that\'s your priority.',
          },
        },
      ],
    },
  ],
};

export default function BonsaiComparison() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
        
        .fade-up:nth-child(1) { animation-delay: 0.1s; }
        .fade-up:nth-child(2) { animation-delay: 0.2s; }
        .fade-up:nth-child(3) { animation-delay: 0.3s; }
        .fade-up:nth-child(4) { animation-delay: 0.4s; }
        .fade-up:nth-child(5) { animation-delay: 0.5s; }
      `}} />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%)',
        borderBottom: '1px solid #DBEAFE',
        padding: '60px 20px',
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: '40px' }}>
            <a href="/" style={{ color: '#2563EB', textDecoration: 'none', fontSize: '14px' }}>
              Home
            </a>
            <span style={{ color: '#999', margin: '0 8px' }}>/</span>
            <a href="/compare" style={{ color: '#2563EB', textDecoration: 'none', fontSize: '14px' }}>
              Compare
            </a>
            <span style={{ color: '#999', margin: '0 8px' }}>/</span>
            <span style={{ color: '#666', fontSize: '14px' }}>Bonsai Alternative</span>
          </nav>

          <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#111', margin: '0 0 16px 0', lineHeight: '1.2' }}>
            Bonsai Alternative for Freelancers
          </h1>
          <p style={{ fontSize: '20px', color: '#666', margin: '0', lineHeight: '1.6', maxWidth: '600px' }}>
            Stop paying per-user fees. Get invoices, contracts, proposals, CRM, and time tracking for £5/mo.
          </p>
        </div>
      </section>

      {/* Why Freelancers Switch Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111', margin: '0 0 48px 0', textAlign: 'center' }}>
            Why Freelancers Switch from Bonsai
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            <div className="fade-up" style={{ padding: '32px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                Per-User Pricing Gets Expensive
              </h3>
              <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                Adding a team member costs $15-59/month per person. One assistant doubles your bill. SoloPad costs £5/mo flat—no per-seat fees.
              </p>
            </div>

            <div className="fade-up" style={{ padding: '32px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                Basic Plan Missing Core Features
              </h3>
              <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                Bonsai's $15/mo Basic tier doesn't include invoicing, contracts, or proposals. You need Essentials ($25/mo) for the basics.
              </p>
            </div>

            <div className="fade-up" style={{ padding: '32px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                Acquisition Creates Uncertainty
              </h3>
              <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                Bonsai is being acquired in late 2026. Pricing, features, and support may change. SoloPad is independent and stable.
              </p>
            </div>

            <div className="fade-up" style={{ padding: '32px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                7-Day Trial Isn't Enough
              </h3>
              <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                Bonsai's free trial lasts only 7 days. SoloPad gives you 30 days to test the full platform risk-free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section style={{ padding: '80px 20px', backgroundColor: '#F8FAFC' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111', margin: '0 0 48px 0', textAlign: 'center' }}>
            Feature Comparison
          </h2>

          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#FFFFFF' }}>
              <thead>
                <tr style={{ backgroundColor: '#EFF6FF', borderBottom: '1px solid #DBEAFE' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#111' }}>
                    Feature
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#111' }}>
                    SoloPad
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#111' }}>
                    Bonsai Basic
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#111' }}>
                    Bonsai Essentials
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Invoicing', solopad: true, basic: false, essentials: true },
                  { feature: 'Contracts', solopad: true, basic: false, essentials: true },
                  { feature: 'Proposals', solopad: true, basic: false, essentials: true },
                  { feature: 'CRM', solopad: true, basic: false, essentials: true },
                  { feature: 'Time Tracking', solopad: true, basic: true, essentials: true },
                  { feature: 'Scheduling', solopad: true, basic: false, essentials: true },
                  { feature: 'Client Portal', solopad: true, basic: false, essentials: true },
                  { feature: 'AI Drafting', solopad: true, basic: false, essentials: false },
                  { feature: 'Tax Preparation', solopad: false, basic: false, essentials: true },
                  { feature: 'Accounting Integration', solopad: false, basic: false, essentials: true },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#111', fontWeight: '500' }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {row.solopad ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                          <path d="M16.707 5.293L8.5 13.5 3.293 8.293" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                          <path d="M5 15L15 5M5 5L15 15" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {row.basic ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                          <path d="M16.707 5.293L8.5 13.5 3.293 8.293" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                          <path d="M5 15L15 5M5 5L15 15" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {row.essentials ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                          <path d="M16.707 5.293L8.5 13.5 3.293 8.293" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                          <path d="M5 15L15 5M5 5L15 15" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section style={{ padding: '80px 20px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111', margin: '0 0 48px 0', textAlign: 'center' }}>
            Pricing Comparison
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '48px' }}>
            <div className="fade-up" style={{ padding: '40px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111', margin: '0 0 8px 0' }}>
                SoloPad Solo
              </h3>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#2563EB', margin: '16px 0', lineHeight: '1' }}>
                £5<span style={{ fontSize: '18px', fontWeight: '500', color: '#666' }}>/mo</span>
              </p>
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 24px 0' }}>
                Everything included
              </p>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0', fontSize: '14px', color: '#666', textAlign: 'left' }}>
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px', flexShrink: 0 }}>
                    <path d="M13.366 4.234L6.4 11.2 2.634 7.434" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Invoices & contracts
                </li>
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px', flexShrink: 0 }}>
                    <path d="M13.366 4.234L6.4 11.2 2.634 7.434" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Client portal
                </li>
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px', flexShrink: 0 }}>
                    <path d="M13.366 4.234L6.4 11.2 2.634 7.434" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Time tracking
                </li>
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px', flexShrink: 0 }}>
                    <path d="M13.366 4.234L6.4 11.2 2.634 7.434" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  AI drafting
                </li>
                <li style={{ display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px', flexShrink: 0 }}>
                    <path d="M13.366 4.234L6.4 11.2 2.634 7.434" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  No per-user fees
                </li>
              </ul>
            </div>

            <div className="fade-up" style={{ padding: '40px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '2px solid #DBEAFE', textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#2563EB', color: '#FFFFFF', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                Most Popular
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111', margin: '0 0 8px 0' }}>
                Bonsai Essentials
              </h3>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#2563EB', margin: '16px 0', lineHeight: '1' }}>
                $25<span style={{ fontSize: '18px', fontWeight: '500', color: '#666' }}>/mo</span>
              </p>
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 24px 0' }}>
                First plan with invoicing
              </p>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0', fontSize: '14px', color: '#666', textAlign: 'left' }}>
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px', flexShrink: 0 }}>
                    <path d="M13.366 4.234L6.4 11.2 2.634 7.434" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Invoices & contracts
                </li>
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px', flexShrink: 0 }}>
                    <path d="M13.366 4.234L6.4 11.2 2.634 7.434" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Tax preparation
                </li>
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px', flexShrink: 0 }}>
                    <path d="M13.366 4.234L6.4 11.2 2.634 7.434" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Accounting tools
                </li>
                <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px', flexShrink: 0 }}>
                    <path d="M13.366 4.234L6.4 11.2 2.634 7.434" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Per-user pricing
                </li>
                <li style={{ display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px', flexShrink: 0 }}>
                    <path d="M13.366 4.234L6.4 11.2 2.634 7.434" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  7-day trial
                </li>
              </ul>
            </div>
          </div>

          <div style={{ padding: '32px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#111', margin: '0', lineHeight: '1.6' }}>
              <strong>SoloPad is 5x cheaper</strong> than Bonsai's cheapest invoicing plan. Add a team member to Bonsai? That's another $25/month. SoloPad stays £5/mo.
            </p>
          </div>
        </div>
      </section>

      {/* What Bonsai Does Better */}
      <section style={{ padding: '80px 20px', backgroundColor: '#F8FAFC' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111', margin: '0 0 48px 0', textAlign: 'center' }}>
            What Bonsai Does Better
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            <div className="fade-up" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                Tax Preparation
              </h3>
              <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                Bonsai includes built-in tax prep and expense tracking. If taxes are your top priority, Bonsai's premium plans offer dedicated tools.
              </p>
            </div>

            <div className="fade-up" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                Built-In Accounting
              </h3>
              <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                Bonsai has native accounting and bookkeeping features. SoloPad integrates with external accounting software instead.
              </p>
            </div>

            <div className="fade-up" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                More Templates
              </h3>
              <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                Bonsai's template library is extensive and is their top driver of user engagement. More options for invoices and contracts.
              </p>
            </div>

            <div className="fade-up" style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                Established History
              </h3>
              <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                Bonsai has been around longer and has a larger user base. More third-party integrations and community resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What SoloPad Does Better */}
      <section style={{ padding: '80px 20px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111', margin: '0 0 48px 0', textAlign: 'center' }}>
            What SoloPad Does Better
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            <div className="fade-up" style={{ padding: '32px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                All Features on Cheapest Plan
              </h3>
              <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                SoloPad's £5/mo plan includes invoices, contracts, proposals, CRM, time tracking, and client portal. No feature paywall.
              </p>
            </div>

            <div className="fade-up" style={{ padding: '32px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                AI Drafting Built-In
              </h3>
              <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                Generate proposals, contracts, and emails with AI. Bonsai charges extra for premium features. SoloPad includes it standard.
              </p>
            </div>

            <div className="fade-up" style={{ padding: '32px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                No Per-User Pricing
              </h3>
              <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                Add unlimited team members for £5/mo. With Bonsai, each person costs $15-59/month. Teams choose SoloPad to save thousands annually.
              </p>
            </div>

            <div className="fade-up" style={{ padding: '32px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                30-Day Free Trial
              </h3>
              <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                Test SoloPad for a full month. Bonsai gives 7 days. More time to see if the platform works for your workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#F8FAFC' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111', margin: '0 0 48px 0', textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'grid', gap: '24px' }}>
            {[
              {
                question: 'Why is Bonsai Basic so limited?',
                answer: 'Bonsai Basic ($15/mo) excludes invoicing, contracts, and proposals—the three core tools freelancers need. You must pay $25/mo for Essentials to access these features. SoloPad includes all of them at £5/mo.',
              },
              {
                question: 'What happens with Bonsai\'s acquisition in 2026?',
                answer: 'Bonsai is being acquired in late 2026. This creates uncertainty around pricing, feature availability, and platform support. SoloPad is independent and stable, with no acquisition plans.',
              },
              {
                question: 'How much does SoloPad cost vs Bonsai?',
                answer: 'SoloPad costs £5/mo for the Solo plan with all core features. Bonsai costs $25/mo minimum for Essentials (the cheapest plan with invoicing). That\'s 5x cheaper for more features on the entry plan.',
              },
              {
                question: 'Can I use Bonsai for team invoicing without paying per user?',
                answer: 'No. Bonsai uses per-user pricing, so adding team members costs $15-59/month per person. SoloPad\'s £5/mo flat rate covers unlimited features for your entire team, making it far more cost-effective for teams.',
              },
              {
                question: 'Does SoloPad have tax preparation like Bonsai?',
                answer: 'SoloPad focuses on client-facing tools (invoices, contracts, proposals, CRM, time tracking). For tax prep, we recommend integrating with specialized platforms. If built-in tax tools are critical, Bonsai Premium and Elite tiers include them.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="fade-up" style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111', margin: '0 0 12px 0' }}>
                  {faq.question}
                </h3>
                <p style={{ fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#EFF6FF', borderTop: '1px solid #DBEAFE', borderBottom: '1px solid #DBEAFE' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111', margin: '0 0 16px 0' }}>
            Ready to Switch?
          </h2>
          <p style={{ fontSize: '18px', color: '#666', margin: '0 0 32px 0', lineHeight: '1.6' }}>
            Start your 30-day free trial. No credit card required. All features included.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/signup" style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1D4ED8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563EB'}
            >
              Start Free Trial
            </a>
            <a href="/compare" style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#FFFFFF',
              color: '#2563EB',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '15px',
              border: '1px solid #DBEAFE',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#F0F9FF'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#FFFFFF'}
            >
              See All Comparisons
            </a>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section style={{ padding: '48px 20px', backgroundColor: '#FFFFFF', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <p style={{ fontSize: '14px', color: '#999', margin: '0', textAlign: 'center', lineHeight: '1.6' }}>
            Pricing and features current as of March 2026. SoloPad is independent and not affiliated with Bonsai. Comparison based on publicly available information. Contact us with questions.
          </p>
        </div>
      </section>
    </>
  );
}