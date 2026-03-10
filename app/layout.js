import { Geist } from "next/font/google";
import SessionProvider from "@/components/shared/SessionProvider";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata = {
  title: "PortalKit — The One-Link Client Portal for Freelancers",
  description: "Send clients one link. They see everything. You stop chasing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
