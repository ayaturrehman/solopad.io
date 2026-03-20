import { Kumbh_Sans } from "next/font/google";
import Script from "next/script";
import SessionProvider from "@/components/shared/SessionProvider";
import "./globals.css";

const kumbhSans = Kumbh_Sans({ subsets: ["latin"], variable: "--font-kumbh-sans" });

export const metadata = {
  title: "SoloPad — The All-in-One Freelance Workspace",
  description: "Proposals, contracts, invoices, CRM, time tracking, scheduling, and a client portal — everything freelancers need to manage clients and get paid. Starting at $12/mo.",
  openGraph: {
    title: "SoloPad — The All-in-One Freelance Workspace",
    description: "Proposals, contracts, invoices, CRM, time tracking, and a client portal for freelancers. Starting at $12/mo.",
    url: "https://solopad.io",
    siteName: "SoloPad",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@solopad_io",
    creator: "@solopad_io",
    title: "SoloPad — The All-in-One Freelance Workspace",
    description: "Everything freelancers need to manage clients and get paid. Starting at $12/mo.",
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
