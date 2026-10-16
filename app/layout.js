import localFont from "next/font/local";
import MarketingAnalytics from "@/components/shared/MarketingAnalytics";
import SessionProvider from "@/components/shared/SessionProvider";
import "./globals.css";

const kumbhSans = localFont({
  src: "./fonts/KumbhSans-Variable.ttf",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-kumbh-sans",
});

export const metadata = {
  title: {
    template: "%s | SoloPad",
    default: "Freelance Invoicing, Contracts & Proposals | SoloPad",
  },
  description:
    "Invoices, contracts, proposals, CRM, scheduling, time tracking & client portal for freelancers. AI drafting included. Starting at £5/mo. Try free for 30 days.",
  metadataBase: new URL("https://www.solopad.io"),
  alternates: {
    canonical: "https://www.solopad.io",
  },
  openGraph: {
    title: "SoloPad — All-in-One Freelance Invoice, Contract & Proposal Software",
    description:
      "Invoices, contracts, proposals, CRM, scheduling & client portal for freelancers. AI drafting included. Starting at £5/mo.",
    url: "https://www.solopad.io",
    siteName: "SoloPad",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@solopad_io",
    creator: "@solopad_io",
    title: "SoloPad — All-in-One Freelance Invoice, Contract & Proposal Software",
    description:
      "Everything freelancers need to manage clients and get paid. AI drafting included. Starting at £5/mo.",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const stored = localStorage.getItem("solopad-theme");
                  const theme = stored === "dark" || stored === "light"
                    ? stored
                    : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                  document.documentElement.setAttribute("data-theme", theme);
                } catch {}
              })();
            `,
          }}
        />
        {/* Organization + SoftwareApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "SoloPad",
                  url: "https://www.solopad.io",
                  logo: "https://www.solopad.io/logo.png",
                  sameAs: [
                    "https://twitter.com/solopad_io",
                    "https://instagram.com/solopad.io"
                  ],
                  description: "All-in-one freelance management software — invoices, contracts, proposals, CRM, scheduling, time tracking & AI drafting."
                },
                {
                  "@type": "SoftwareApplication",
                  name: "SoloPad",
                  url: "https://www.solopad.io",
                  applicationCategory: "BusinessApplication",
                  operatingSystem: "Web",
                  offers: {
                    "@type": "Offer",
                    price: "5.00",
                    priceCurrency: "GBP",
                    description: "Solo plan — starting at £5/mo"
                  },
                  description: "Freelance management software with invoices, contracts, proposals, CRM, scheduling, time tracking, client portal, and AI drafting.",
                  featureList: "Invoicing, Contracts, Proposals, CRM, Time Tracking, Scheduling, Client Portal, AI Drafting"
                }
              ]
            }),
          }}
        />
      </head>
      <body className={`${kumbhSans.variable} font-sans antialiased`}>
        <MarketingAnalytics />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
