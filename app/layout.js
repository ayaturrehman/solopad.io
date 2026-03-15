import { Kumbh_Sans } from "next/font/google";
import SessionProvider from "@/components/shared/SessionProvider";
import "./globals.css";

const kumbhSans = Kumbh_Sans({ subsets: ["latin"], variable: "--font-kumbh-sans" });

export const metadata = {
  title: "SoloPad — The All-in-One Freelance Workspace",
  description: "Proposals, contracts, invoices, CRM, time tracking, scheduling, and a client portal — everything freelancers need to manage clients and get paid. Starting at $9/mo.",
  openGraph: {
    title: "SoloPad — The All-in-One Freelance Workspace",
    description: "Proposals, contracts, invoices, CRM, time tracking, and a client portal for freelancers. Starting at $9/mo.",
    url: "https://solopad.io",
    siteName: "SoloPad",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SoloPad — The All-in-One Freelance Workspace",
    description: "Everything freelancers need to manage clients and get paid. Starting at $9/mo.",
  },
};

export const viewport = {
  width: 1280,
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
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
