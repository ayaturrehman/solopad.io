import { Kumbh_Sans } from "next/font/google";
import Script from "next/script";
import SessionProvider from "@/components/shared/SessionProvider";
import "./globals.css";

const kumbhSans = Kumbh_Sans({ subsets: ["latin"], variable: "--font-kumbh-sans" });

export const metadata = {
  title: {
    template: "%s | SoloPad",
    default: "SoloPad — All-in-One Freelance Invoice, Contract & Proposal Software",
  },
  description:
    "Invoices, contracts, proposals, CRM, scheduling, time tracking & client portal for freelancers. AI drafting included. Starting at £5/mo. Try free for 30 days.",
  metadataBase: new URL("https://solopad.io"),
  openGraph: {
    title: "SoloPad — All-in-One Freelance Invoice, Contract & Proposal Software",
    description:
      "Invoices, contracts, proposals, CRM, scheduling & client portal for freelancers. AI drafting included. Starting at £5/mo.",
    url: "https://solopad.io",
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
                  url: "https://solopad.io",
                  logo: "https://solopad.io/logo.png",
                  sameAs: [
                    "https://twitter.com/solopad_io",
                    "https://instagram.com/solopad.io"
                  ],
                  description: "All-in-one freelance management software — invoices, contracts, proposals, CRM, scheduling, time tracking & AI drafting."
                },
                {
                  "@type": "SoftwareApplication",
                  name: "SoloPad",
                  url: "https://solopad.io",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RGD4VP2T9Y"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RGD4VP2T9Y');
          `}
        </Script>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
