export const metadata = {
  title: 'Plutio Alternative for Freelancers',
  description: 'Compare Plutio vs SoloPad. Better pricing, no client limits, AI drafting, and simpler freelance management. Switch to SoloPad for £5/mo.',
  alternates: { canonical: 'https://www.solopad.io/compare/plutio-alternative' },
  openGraph: {
    title: 'Plutio Alternative for Freelancers | SoloPad',
    description: 'Compare Plutio vs SoloPad. Better pricing, no client limits, AI drafting, and simpler freelance management.',
    url: 'https://www.solopad.io/compare/plutio-alternative',
    type: 'article',
    images: [
      {
        url: 'https://www.solopad.io/og-plutio-comparison.png',
        width: 1200,
        height: 630,
        alt: 'Plutio vs SoloPad comparison',
      },
    ],
  },
  robots: 'index, follow',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'Plutio Alternative for Freelancers | SoloPad',
      description: 'Compare Plutio vs SoloPad. Better pricing, no client limits, AI drafting, and simpler freelance management.',
      image: 'https://www.solopad.io/og-plutio-comparison.png',
      author: {
        '@type': 'Organization',
        name: 'SoloPad',
        url: 'https://www.solopad.io',
      },
      datePublished: '2026-03-23',
      dateModified: '2026-03-23',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.solopad.io',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Compare',
          item: 'https://www.solopad.io/compare',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Plutio Alternative',
          item: 'https://www.solopad.io/compare/plutio-alternative',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Can I import my data from Plutio to SoloPad?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SoloPad supports data imports from most freelance management tools including Plutio. Contact support@solopad.io for assistance with your migration.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does SoloPad have client limits like Plutio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. SoloPad has no limits on active clients at any price tier. Manage unlimited clients with the Solo plan at £5/mo.',
          },
        },
        {
          '@type': 'Question',
          name: 'What if I need white-label features?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SoloPad is designed for individual freelancers and solo practitioners. If you need white-label portals for client resale, Plutio may be better suited. However, most solo freelancers find SoloPad\'s branding options sufficient.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the AI drafting in SoloPad accurate?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SoloPad\'s AI drafting generates proposal and contract templates in seconds based on your industry and project details. You can edit any generated draft before sending.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I cancel anytime?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SoloPad has no long-term contracts. Cancel your subscription anytime with no penalties or hidden fees.',
          },
        },
      ],
    },
  ],
};

export default function PlutioAlternativePage() {
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
        .cta-primary:hover { background: #1D4ED8 !important; }
        .cta-secondary:hover { background: #EFF6FF !important; border-color: #2563EB !important; }
        .cta-light:hover { background: #f0f0f0 !important; }
        .cta-glass:hover { background: rgba(255,255,255,0.3) !important; }
      `}} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section style={{
        background: '#EDE7DB',
        borderBottom: '1px solid #DBEAFE',
        padding: '80px 20px',
      }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
        }}>
          {/* Breadcrumb */}
          <nav style={{
            marginBottom: '32px',
            fontSize: '14px',
          }}>
            <a href="/" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: '500' }}>
              Home
            </a>
            <span style={{ color: '#999', margin: '0 8px' }}>/</span>
            <a href="/compare" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: '500' }}>
              Compare
            </a>
            <span style={{ color: '#999', margin: '0 8px' }}>/</span>
            <span style={{ color: '#666' }}>Plutio Alternative</span>
          </nav>

          {/* Heading */}
          <h1 className="fade-up" style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#111',
            marginBottom: '16px',
            lineHeight: '1.2',
          }}>
            Plutio Alternative for Freelancers
          </h1>

          <p className="fade-up fade-up-delay-1" style={{
            fontSize: '20px',
            color: '#666',
            marginBottom: '24px',
            lineHeight: '1.6',
            maxWidth: '600px',
          }}>
            Better pricing. No client limits. Built for simplicity.
          </p>

          <div className="fade-up fade-up-delay-2" style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <a href="https://app.solopad.io/signup" style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: '#2563EB',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            className="cta-primary"
            >
              Start Free Trial
            </a>
            <a href="#comparison" style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: 'white',
              color: '#2563EB',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              border: '2px solid #DBEAFE',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            className="cta-secondary"
            >
              View Comparison
            </a>
          </div>
        </div>
      </section>

      {/* Why Freelancers Switch From Plutio */}
      <section style={{
        padding: '80px 20px',
        background: 'white',
      }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
        }}>
          <h2 className="fade-up" style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#111',
            marginBottom: '32px',
          }}>
            Why Freelancers Switch from Plutio
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                title: 'Hidden Client Limits',
                description: 'Plutio Essentials caps you at 9 active clients per month. A hard ceiling that stifles growth.',
              },
              {
                title: 'Pricing Adds Up',
                description: 'Start at $15/mo. Scale to Core at $19/mo. Need multiple seats? Costs multiply fast.',
              },
              {
                title: 'Built for Agencies',
                description: 'Plutio targets teams and agencies. Solo freelancers inherit complexity they don\'t need.',
              },
              {
                title: 'Unnecessary Features',
                description: 'Overloaded with features designed for team workflows. Simple freelancing gets buried.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="fade-up"
                style={{
                  padding: '24px',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #F1F5F9',
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0,
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111',
                  marginBottom: '8px',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.6',
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section id="comparison" style={{
        padding: '80px 20px',
        background: '#F8FAFC',
      }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
        }}>
          <h2 className="fade-up" style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#111',
            marginBottom: '48px',
            textAlign: 'center',
          }}>
            Feature Comparison
          </h2>

          <div style={{
            overflowX: 'auto',
            borderRadius: '8px',
            border: '1px solid #F1F5F9',
            background: 'white',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#111',
                    background: '#F8FAFC',
                  }}>
                    Feature
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#111',
                    background: '#EFF6FF',
                  }}>
                    SoloPad
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#111',
                    background: '#F8FAFC',
                  }}>
                    Plutio
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Invoicing', solopad: true, plutio: true },
                  { name: 'Contracts', solopad: true, plutio: true },
                  { name: 'Proposals', solopad: true, plutio: true },
                  { name: 'CRM', solopad: true, plutio: true },
                  { name: 'Time Tracking', solopad: true, plutio: true },
                  { name: 'Scheduling', solopad: true, plutio: true },
                  { name: 'Client Portal', solopad: true, plutio: true },
                  { name: 'AI Drafting', solopad: true, plutio: false },
                  { name: 'Project Management', solopad: false, plutio: true },
                  { name: 'White-Label Portal', solopad: false, plutio: true },
                  { name: 'Unlimited Clients', solopad: true, plutio: false },
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: idx % 2 === 0 ? 'white' : '#F8FAFC',
                    }}
                  >
                    <td style={{
                      padding: '16px',
                      color: '#111',
                      fontWeight: '500',
                    }}>
                      {row.name}
                    </td>
                    <td style={{
                      padding: '16px',
                      textAlign: 'center',
                    }}>
                      {row.solopad ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </td>
                    <td style={{
                      padding: '16px',
                      textAlign: 'center',
                    }}>
                      {row.plutio ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
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
      <section style={{
        padding: '80px 20px',
        background: 'white',
      }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
        }}>
          <h2 className="fade-up" style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#111',
            marginBottom: '48px',
            textAlign: 'center',
          }}>
            Pricing Comparison
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            maxWidth: '800px',
            margin: '0 auto',
          }}>
            {[
              {
                name: 'SoloPad Solo',
                price: '£5/mo',
                period: 'billed monthly',
                features: [
                  'All core features',
                  'Unlimited clients',
                  'AI drafting',
                  'Client portal',
                  'Cancel anytime',
                ],
                highlight: true,
              },
              {
                name: 'Plutio Core',
                price: '$19/mo',
                period: 'billed monthly',
                features: [
                  'Core features',
                  'Limited to higher tier clients',
                  'No AI drafting',
                  'Client portal',
                  'Requires yearly commitment',
                ],
                highlight: false,
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className="fade-up"
                style={{
                  padding: '32px',
                  borderRadius: '8px',
                  border: plan.highlight ? '2px solid #2563EB' : '1px solid #F1F5F9',
                  background: plan.highlight ? '#EFF6FF' : '#F8FAFC',
                  position: 'relative',
                  animationDelay: `${idx * 0.2}s`,
                  opacity: 0,
                }}
              >
                {plan.highlight && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '20px',
                    background: '#2563EB',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    Best Value
                  </div>
                )}

                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111',
                  marginBottom: '8px',
                  marginTop: plan.highlight ? '16px' : '0',
                }}>
                  {plan.name}
                </h3>

                <div style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: '#2563EB',
                  marginBottom: '8px',
                }}>
                  {plan.price}
                </div>

                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '24px',
                }}>
                  {plan.period}
                </p>

                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}>
                  {plan.features.map((feature, fidx) => (
                    <li
                      key={fidx}
                      style={{
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            marginTop: '32px',
          }}>
            SoloPad is 4x cheaper. That's £240/year saved vs Plutio's Core plan at $228/year (rough USD-GBP equivalent).
          </p>
        </div>
      </section>

      {/* What Plutio Does Better */}
      <section style={{
        padding: '80px 20px',
        background: '#F8FAFC',
      }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
        }}>
          <h2 className="fade-up" style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#111',
            marginBottom: '32px',
          }}>
            What Plutio Does Better
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#666',
            lineHeight: '1.8',
            marginBottom: '32px',
            maxWidth: '700px',
          }}>
            Plutio is a mature platform. We won't pretend it doesn't have strengths.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                title: 'Project Management',
                description: 'Plutio has deeper project tracking and task management built in for team workflows.',
              },
              {
                title: 'White-Label Portals',
                description: 'Fully customizable client portals with your branding. Useful if you resell as your own product.',
              },
              {
                title: 'Advanced Automations',
                description: 'More complex automation rules and integrations. Better for teams that need sophisticated workflows.',
              },
              {
                title: 'Established Platform',
                description: 'Plutio has been around longer and has a larger feature set overall. Mature ecosystem.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="fade-up"
                style={{
                  padding: '24px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #F1F5F9',
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0,
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111',
                  marginBottom: '8px',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.6',
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What SoloPad Does Better */}
      <section style={{
        padding: '80px 20px',
        background: 'white',
      }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
        }}>
          <h2 className="fade-up" style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#111',
            marginBottom: '32px',
          }}>
            What SoloPad Does Better
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#666',
            lineHeight: '1.8',
            marginBottom: '32px',
            maxWidth: '700px',
          }}>
            SoloPad is built for the modern solo freelancer. These advantages matter if you're not a team.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                title: 'No Client Limits',
                description: 'Unlimited active clients at any tier. Grow without hitting arbitrary caps or paying more.',
              },
              {
                title: 'AI Drafting',
                description: 'Generate proposals and contracts in seconds with AI. Edit once. Send. Plutio doesn\'t have this.',
              },
              {
                title: 'Simpler Interface',
                description: 'Everything you need. Nothing you don\'t. Built for solo freelancers, not agencies.',
              },
              {
                title: '4x Cheaper',
                description: 'At £5/mo, SoloPad costs 75% less than Plutio Core. Same core features. Better price.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="fade-up"
                style={{
                  padding: '24px',
                  background: '#EFF6FF',
                  borderRadius: '8px',
                  border: '2px solid #DBEAFE',
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0,
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111',
                  marginBottom: '8px',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.6',
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{
        padding: '80px 20px',
        background: '#F8FAFC',
      }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
        }}>
          <h2 className="fade-up" style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#111',
            marginBottom: '48px',
          }}>
            Frequently Asked Questions
          </h2>

          <div style={{
            display: 'grid',
            gap: '24px',
            maxWidth: '700px',
          }}>
            {[
              {
                q: 'Can I import my data from Plutio to SoloPad?',
                a: 'Yes. SoloPad supports data imports from most freelance management tools including Plutio. Contact support@solopad.io for assistance with your migration.',
              },
              {
                q: 'Does SoloPad have client limits like Plutio?',
                a: 'No. SoloPad has no limits on active clients at any price tier. Manage unlimited clients with the Solo plan at £5/mo.',
              },
              {
                q: 'What if I need white-label features?',
                a: 'SoloPad is designed for individual freelancers and solo practitioners. If you need white-label portals for client resale, Plutio may be better suited. However, most solo freelancers find SoloPad\'s branding options sufficient.',
              },
              {
                q: 'Is the AI drafting in SoloPad accurate?',
                a: 'Yes. SoloPad\'s AI drafting generates proposal and contract templates in seconds based on your industry and project details. You can edit any generated draft before sending.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. SoloPad has no long-term contracts. Cancel your subscription anytime with no penalties or hidden fees.',
              },
            ].map((item, idx) => (
              <details
                key={idx}
                className="fade-up"
                style={{
                  padding: '24px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0,
                }}
              >
                <summary style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111',
                  outline: 'none',
                  userSelect: 'none',
                }}>
                  {item.q}
                </summary>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.6',
                  marginTop: '16px',
                }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)',
        color: 'white',
      }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <h2 className="fade-up" style={{
            fontSize: '40px',
            fontWeight: '700',
            marginBottom: '16px',
          }}>
            Ready to Switch?
          </h2>

          <p className="fade-up fade-up-delay-1" style={{
            fontSize: '18px',
            opacity: 0.95,
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}>
            SoloPad makes freelance management simple. Start free, no credit card required. Import your Plutio data whenever you're ready.
          </p>

          <div className="fade-up fade-up-delay-2" style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            opacity: 0,
          }}>
            <a href="https://app.solopad.io/signup" style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'white',
              color: '#2563EB',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            className="cta-light"
            >
              Start Free Trial
            </a>
            <a href="mailto:support@solopad.io" style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              border: '2px solid white',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            className="cta-glass"
            >
              Talk to Support
            </a>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section style={{
        padding: '40px 20px',
        background: '#F8FAFC',
        borderTop: '1px solid #F1F5F9',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '13px',
          color: '#999',
          maxWidth: '1080px',
          margin: '0 auto',
          lineHeight: '1.6',
        }}>
          Pricing accurate as of March 2026. SoloPad and Plutio pricing may change. All feature comparisons based on official documentation. Learn more about <a href="/" style={{ color: '#2563EB', textDecoration: 'none' }}>SoloPad features</a>.
        </p>
      </section>
    </>
  );
}