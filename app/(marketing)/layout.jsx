import MarketingNav from "@/components/marketing/MarketingNav";

export const metadata = {
  title: {
    template: "%s | SoloPad",
    default: "SoloPad — All-in-One Freelance Invoice, Contract & Proposal Software",
  },
  description:
    "Invoices, contracts, proposals, CRM, scheduling, time tracking & client portal for freelancers. AI drafting included. Starting at £5/mo. Try free for 30 days.",
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
  alternates: {
    canonical: "https://solopad.io",
  },
};

export default function MarketingLayout({ children }) {
  return (
    <>
      <MarketingNav />
      {children}
    </>
  );
}
