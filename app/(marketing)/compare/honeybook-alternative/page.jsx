import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HoneyBook Alternative for Freelancers | SoloPad',
  description: 'Why thousands of solo freelancers are switching from HoneyBook to SoloPad. Compare pricing, features, and discover why SoloPad saves you £660/year.',
  canonical: 'https://solopad.io/compare/honeybook-alternative',
  openGraph: {
    title: 'HoneyBook Alternative for Freelancers | SoloPad',
    description: 'Why thousands of solo freelancers are switching from HoneyBook to SoloPad. Compare pricing, features, and discover why SoloPad saves you £660/year.',
    url: 'https://solopad.io/compare/honeybook-alternative',
    type: 'article',
    images: [
      {
        url: 'https://solopad.io/og-honeybook-comparison.jpg',
        width: 1200,
        height: 630,
        alt: 'HoneyBook Alternative Comparison',
      },
    ],
  },
};

export default function HoneybookAlternativePage() {
  const honeybookPrices = {
    starter: 36,
    essentials: 59,
    premium: 129,
  };

  const solopadPrice = 5;
  const annualHoneybookStarter = honeybookPrices.starter * 12;
  const annualSolopad = solopadPrice * 12;
  const annualSavings = annualHoneybookStarter - annualSolopad;

  return (
    <>
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
        .fade-up-delay-4 { animation-delay: 0.4s; opacity: 0; }
      `}} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Article',
                headline: 'HoneyBook Alternative for Freelancers',
                description: 'Why thousands of solo freelancers are switching from HoneyBook to SoloPad. Compare pricing, features, and discover why SoloPad saves you £660/year.',
                datePublished: '2026-03-23',
                dateModified: '2026-03-23',
                author: {
                  '@type': 'Organization',
                  name: 'SoloPad',
                  url: 'https://solopad.io',
                },
                publisher: {
                  '@type': 'Organization',
                  name: 'SoloPad',
                  url: 'https://solopad.io',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://solopad.io/logo.svg',
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
                    name: 'HoneyBook Alternative',
                    item: 'https://solopad.io/compare/honeybook-alternative',
                  },
                ],
              },
              {
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'Is SoloPad really cheaper than HoneyBook?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes. SoloPad is £5/month (approximately $6.25/month USD). HoneyBook\'s starter plan is $36/month, and prices go up from there. That\'s a difference of over £660 per year.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Can I migrate from HoneyBook to SoloPad?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes. You can export your data from HoneyBook and import it into SoloPad. We have detailed migration guides available in our help center.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Does SoloPad have automations like HoneyBook?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'SoloPad has automations, but HoneyBook\'s automation engine is more sophisticated. However, for solo freelancers, SoloPad\'s automations cover the essentials: invoice reminders, contract signing workflows, and proposal follow-ups.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What about payment processing fees?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'HoneyBook charges 2.9% on card payments and 1.5% on bank transfers. SoloPad charges zero platform transaction fees on the Starter plan — just standard card processing rates. Money goes directly to your bank account.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Does SoloPad have time tracking?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes. SoloPad includes time tracking built-in, which HoneyBook doesn\'t offer. This is one of the biggest advantages for freelancers who bill hourly or want to track project time.',
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />

      <main style={{ width: '100%', backgroundColor: '#fff' }}>
        {/* Hero Section */}
        <section
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F4FF 50%, #F8FAFF 100%)',
            padding: '60px 20px',
            textAlign: 'center',
            borderBottom: '1px solid #DBEAFE',
          }}
        >
          <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <nav
              style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '30px',
                display: 'flex',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <a href="/" style={{ color: '#2563EB', textDecoration: 'none' }}>
                Home
              </a>
              <span>/</span>
              <a href="/compare" style={{ color: '#2563EB', textDecoration: 'none' }}>
                Compare
              </a>
              <span>/</span>
              <span>HoneyBook Alternative</span>
            </nav>

            <h1
              className="fade-up fade-up-delay-1"
              style={{
                fontSize: '48px',
                fontWeight: '700',
                color: '#111',
                margin: '0 0 20px 0',
                lineHeight: '1.2',
              }}
            >
              HoneyBook Alternative for Freelancers
            </h1>

            <p
              className="fade-up fade-up-delay-2"
              style={{
                fontSize: '18px',
                color: '#666',
                margin: '0',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: '1.6',
              }}
            >
              Discover why thousands of solo freelancers are switching to SoloPad. Save £660/year, get AI drafting, time tracking, and a platform built for you — not for agencies.
            </p>
          </div>
        </section>

        {/* Why Freelancers Switch Section */}
        <section
          style={{
            padding: '60px 20px',
            maxWidth: '1080px',
            margin: '0 auto',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <h2
            className="fade-up fade-up-delay-1"
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111',
              margin: '0 0 40px 0',
            }}
          >
            Why Freelancers Switch from HoneyBook
          </h2>

          <div
            className="fade-up fade-up-delay-2"
            style={{
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.8',
              marginBottom: '20px',
            }}
          >
            <p>
              I loved HoneyBook when I first started. It felt professional. The templates were beautiful. But over five years, something changed. The pricing went up. Then it went up again. A 89% price increase over three years. That hurt.
            </p>
          </div>

          <div
            className="fade-up fade-up-delay-3"
            style={{
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.8',
              marginBottom: '20px',
            }}
          >
            <p>
              HoneyBook was built for studios and agencies. Team collaboration. Complex workflows. Booking pages that close deals. Those features are powerful. But as a solo freelancer, I was paying for features I never used. I didn't have a team to collaborate with. I didn't need sophisticated booking flows. I just needed to send invoices, manage clients, and track my time.
            </p>
          </div>

          <div
            className="fade-up fade-up-delay-4"
            style={{
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.8',
            }}
          >
            <p>
              Then I found SoloPad. £5 a month. Invoices, contracts, proposals, CRM, time tracking, scheduling, and a client portal. Everything I actually needed. No bloat. No $36 price tag for a starter plan. Just a tool built for freelancers like me.
            </p>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section
          style={{
            padding: '60px 20px',
            maxWidth: '1080px',
            margin: '0 auto',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <h2
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111',
              margin: '0 0 40px 0',
            }}
          >
            Feature Comparison
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '15px',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #DBEAFE' }}>
                  <th
                    style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#111',
                    }}
                  >
                    Feature
                  </th>
                  <th
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#111',
                    }}
                  >
                    SoloPad
                  </th>
                  <th
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#111',
                    }}
                  >
                    HoneyBook
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Invoicing', solopad: true, honeybook: true },
                  { feature: 'Contracts', solopad: true, honeybook: true },
                  { feature: 'Proposals', solopad: true, honeybook: true },
                  { feature: 'CRM', solopad: true, honeybook: true },
                  { feature: 'Time Tracking', solopad: true, honeybook: false },
                  { feature: 'Scheduling', solopad: true, honeybook: true },
                  { feature: 'Client Portal', solopad: true, honeybook: true },
                  { feature: 'AI Drafting', solopad: true, honeybook: false },
                  { feature: 'E-Signatures', solopad: true, honeybook: true },
                  { feature: 'Automations', solopad: true, honeybook: true },
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: idx % 2 === 0 ? '#fff' : '#F8FAFC',
                    }}
                  >
                    <td style={{ padding: '16px', color: '#111', fontWeight: '500' }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {row.solopad ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          style={{ margin: '0 auto', display: 'block' }}
                        >
                          <path
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            fill="#10b981"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          style={{ margin: '0 auto', display: 'block' }}
                        >
                          <path
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            fill="#ef4444"
                          />
                        </svg>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {row.honeybook ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          style={{ margin: '0 auto', display: 'block' }}
                        >
                          <path
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            fill="#10b981"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          style={{ margin: '0 auto', display: 'block' }}
                        >
                          <path
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            fill="#ef4444"
                          />
                        </svg>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pricing Comparison */}
        <section
          style={{
            padding: '60px 20px',
            maxWidth: '1080px',
            margin: '0 auto',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <h2
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111',
              margin: '0 0 40px 0',
            }}
          >
            Pricing Comparison
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              marginBottom: '40px',
            }}
          >
            {/* SoloPad Pricing Card */}
            <div
              style={{
                padding: '30px',
                border: '2px solid #2563EB',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
              }}
            >
              <h3 style={{ color: '#111', margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>
                SoloPad Solo
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '36px', fontWeight: '700', color: '#2563EB' }}>£5</span>
                <span style={{ fontSize: '14px', color: '#666', marginLeft: '8px' }}>/month</span>
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#fff',
                  borderRadius: '6px',
                }}
              >
                <strong style={{ color: '#111', display: 'block', marginBottom: '8px' }}>
                  Annual cost:
                </strong>
                <span style={{ fontSize: '16px', color: '#2563EB', fontWeight: '600' }}>
                  £{annualSolopad}/year
                </span>
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: '0',
                  margin: '0',
                  fontSize: '14px',
                  color: '#666',
                }}
              >
                <li style={{ marginBottom: '10px' }}>✓ All features included</li>
                <li style={{ marginBottom: '10px' }}>✓ No hidden charges</li>
                <li>✓ AI drafting built-in</li>
              </ul>
            </div>

            {/* HoneyBook Pricing Card */}
            <div
              style={{
                padding: '30px',
                border: '1px solid #F1F5F9',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
              }}
            >
              <h3 style={{ color: '#111', margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>
                HoneyBook Starter
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '36px', fontWeight: '700', color: '#111' }}>
                  ${honeybookPrices.starter}
                </span>
                <span style={{ fontSize: '14px', color: '#666', marginLeft: '8px' }}>/month</span>
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#fff',
                  borderRadius: '6px',
                }}
              >
                <strong style={{ color: '#111', display: 'block', marginBottom: '8px' }}>
                  Annual cost:
                </strong>
                <span style={{ fontSize: '16px', color: '#111', fontWeight: '600' }}>
                  ${annualHoneybookStarter}/year
                </span>
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: '0',
                  margin: '0',
                  fontSize: '14px',
                  color: '#666',
                }}
              >
                <li style={{ marginBottom: '10px' }}>✓ Core features</li>
                <li style={{ marginBottom: '10px' }}>+ 2.9% payment fees</li>
                <li>✓ Limited automations</li>
              </ul>
            </div>
          </div>

          <div
            style={{
              padding: '20px',
              backgroundColor: '#EFF6FF',
              borderRadius: '8px',
              border: '1px solid #DBEAFE',
              color: '#111',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            <strong>You save £{annualSavings}/year</strong> by switching to SoloPad. That's enough for groceries, a client dinner, or reinvesting in your business.
          </div>

          <p
            style={{
              fontSize: '14px',
              color: '#666',
              marginTop: '20px',
              marginBottom: '0',
            }}
          >
            Note: HoneyBook charges 2.9% on card payments and 1.5% on bank transfers. With SoloPad, clients pay online and money goes directly to your bank account within 2-3 business days.
          </p>
        </section>

        {/* What HoneyBook Does Better */}
        <section
          style={{
            padding: '60px 20px',
            maxWidth: '1080px',
            margin: '0 auto',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <h2
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111',
              margin: '0 0 30px 0',
            }}
          >
            What HoneyBook Does Better
          </h2>

          <p
            style={{
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.8',
              marginBottom: '20px',
            }}
          >
            Honesty matters. HoneyBook isn't perfect, but it does some things really well.
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: '0',
              margin: '0',
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.8',
            }}
          >
            <li style={{ marginBottom: '16px', paddingLeft: '24px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0',
                  color: '#2563EB',
                  fontWeight: '600',
                }}
              >
                +
              </span>
              <strong style={{ color: '#111' }}>Automation engine:</strong> HoneyBook's automation rules are more sophisticated. Conditional logic, multi-step workflows, and complex triggers.
            </li>
            <li style={{ marginBottom: '16px', paddingLeft: '24px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0',
                  color: '#2563EB',
                  fontWeight: '600',
                }}
              >
                +
              </span>
              <strong style={{ color: '#111' }}>Booking pages:</strong> HoneyBook's calendar scheduling and booking pages are beautiful and convert well. Great if you need to close deals faster.
            </li>
            <li style={{ marginBottom: '16px', paddingLeft: '24px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0',
                  color: '#2563EB',
                  fontWeight: '600',
                }}
              >
                +
              </span>
              <strong style={{ color: '#111' }}>Integrations:</strong> HoneyBook connects to more third-party tools. If you need deep Slack or Zapier integrations, HoneyBook has more.
            </li>
            <li style={{ paddingLeft: '24px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0',
                  color: '#2563EB',
                  fontWeight: '600',
                }}
              >
                +
              </span>
              <strong style={{ color: '#111' }}>Brand history:</strong> HoneyBook's been around longer. More case studies, bigger community, more content.
            </li>
          </ul>
        </section>

        {/* What SoloPad Does Better */}
        <section
          style={{
            padding: '60px 20px',
            maxWidth: '1080px',
            margin: '0 auto',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <h2
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111',
              margin: '0 0 30px 0',
            }}
          >
            What SoloPad Does Better
          </h2>

          <ul
            style={{
              listStyle: 'none',
              padding: '0',
              margin: '0',
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.8',
            }}
          >
            <li style={{ marginBottom: '16px', paddingLeft: '24px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0',
                  color: '#2563EB',
                  fontWeight: '600',
                }}
              >
                +
              </span>
              <strong style={{ color: '#111' }}>Price:</strong> £5/month vs $36/month. That's £660/year in your pocket, not HoneyBook's.
            </li>
            <li style={{ marginBottom: '16px', paddingLeft: '24px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0',
                  color: '#2563EB',
                  fontWeight: '600',
                }}
              >
                +
              </span>
              <strong style={{ color: '#111' }}>AI Drafting:</strong> Write contracts, proposals, and emails in seconds. HoneyBook doesn't have this.
            </li>
            <li style={{ marginBottom: '16px', paddingLeft: '24px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0',
                  color: '#2563EB',
                  fontWeight: '600',
                }}
              >
                +
              </span>
              <strong style={{ color: '#111' }}>Time Tracking:</strong> Built-in time tracking for hourly work. HoneyBook doesn't offer this at all.
            </li>
            <li style={{ marginBottom: '16px', paddingLeft: '24px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0',
                  color: '#2563EB',
                  fontWeight: '600',
                }}
              >
                +
              </span>
              <strong style={{ color: '#111' }}>Simplicity:</strong> Built for solo freelancers. No feature overload. Everything you need, nothing you don't.
            </li>
            <li style={{ paddingLeft: '24px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0',
                  color: '#2563EB',
                  fontWeight: '600',
                }}
              >
                +
              </span>
              <strong style={{ color: '#111' }}>No feature gates:</strong> Everything included at one price. No "upgrade to add team members" or "pay extra for X."
            </li>
          </ul>
        </section>

        {/* FAQ Section */}
        <section
          style={{
            padding: '60px 20px',
            maxWidth: '1080px',
            margin: '0 auto',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <h2
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111',
              margin: '0 0 40px 0',
            }}
          >
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'grid', gap: '20px' }}>
            {[
              {
                q: 'Is SoloPad really cheaper than HoneyBook?',
                a: 'Yes. SoloPad is £5/month. HoneyBook\'s starter plan is $36/month (roughly £28), Essentials is $59/month, and Premium is $129/month. Over a year, you\'ll save £660+ with SoloPad.',
              },
              {
                q: 'Can I migrate from HoneyBook to SoloPad?',
                a: 'Yes. You can export your clients, invoices, and project data from HoneyBook and import them into SoloPad. We have step-by-step migration guides in our help center.',
              },
              {
                q: 'Does SoloPad have automations like HoneyBook?',
                a: 'SoloPad has automations, but HoneyBook\'s are more advanced. For solo freelancers though, SoloPad\'s automations cover what you actually need: invoice reminders, contract signing workflows, and proposal follow-ups.',
              },
              {
                q: 'What about payment processing fees?',
                a: 'HoneyBook charges 2.9% on card payments and 1.5% on bank transfers. With SoloPad, you just connect your bank account and clients pay online. Money goes directly to your bank within 2-3 business days. Standard card processing rates apply.',
              },
              {
                q: 'Does SoloPad have time tracking?',
                a: 'Yes. SoloPad includes time tracking built-in. This is one of the biggest advantages for freelancers who bill hourly or want to track project time. HoneyBook doesn\'t offer this at all.',
              },
            ].map((item, idx) => (
              <details
                key={idx}
                style={{
                  padding: '20px',
                  border: '1px solid #DBEAFE',
                  borderRadius: '6px',
                  backgroundColor: '#F8FAFC',
                  cursor: 'pointer',
                }}
              >
                <summary
                  style={{
                    fontWeight: '600',
                    color: '#111',
                    fontSize: '16px',
                    userSelect: 'none',
                    outline: 'none',
                  }}
                >
                  {item.q}
                </summary>
                <p
                  style={{
                    color: '#666',
                    fontSize: '15px',
                    lineHeight: '1.7',
                    marginTop: '12px',
                    marginBottom: '0',
                  }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section
          style={{
            padding: '60px 20px',
            maxWidth: '1080px',
            margin: '0 auto',
            textAlign: 'center',
            backgroundColor: '#EFF6FF',
            borderRadius: '12px',
          }}
        >
          <h2
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111',
              margin: '0 0 15px 0',
            }}
          >
            Ready to Switch?
          </h2>

          <p
            style={{
              fontSize: '18px',
              color: '#666',
              margin: '0 0 30px 0',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Try SoloPad free for 30 days. No credit card. No commitment. Just sign up and start managing your freelance business better.
          </p>

          <a
            href="/signup"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#2563EB',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#1d4ed8')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#2563EB')}
          >
            Start Free Trial
          </a>

          <p
            style={{
              fontSize: '13px',
              color: '#666',
              margin: '20px 0 0 0',
            }}
          >
            You'll save £660/year compared to HoneyBook Starter.
          </p>
        </section>
      </main>
    </>
  );
}