import { Newsreader, Source_Sans_3 } from "next/font/google";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import "./marketing.css";

const display = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  description:
    "Invoices, contracts, proposals, CRM, scheduling, time tracking & client portal for freelancers. AI drafting included. Starting at £5/mo. Try free for 30 days.",
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
  alternates: {
    canonical: "https://www.solopad.io",
  },
};

export default function MarketingLayout({ children }) {
  return (
    <div className={`${display.variable} ${body.variable} mk`}>
      <a href="#main-content" className="mk-skip">
        Skip to content
      </a>
      <MarketingNav />
      <div id="main-content">{children}</div>
      <MarketingFooter />
    </div>
  );
}
