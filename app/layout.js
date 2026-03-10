import { Plus_Jakarta_Sans } from "next/font/google";
import SessionProvider from "@/components/shared/SessionProvider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta-sans" });

export const metadata = {
  title: "PortalKit — The One-Link Client Portal for Freelancers",
  description: "Send clients one link. They see everything. You stop chasing.",
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
                  const stored = localStorage.getItem("portalkit-theme");
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
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
