import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const isPublicBooking = req.nextUrl.pathname === "/api/bookings" && req.method === "POST";
    if (req.nextUrl.pathname.startsWith("/api/") && !req.nextauth.token && !isPublicBooking) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      // API handlers return JSON; browser pages still use the login redirect.
      authorized: ({ req, token }) => Boolean(token) || req.nextUrl.pathname.startsWith("/api/"),
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*", "/projects/:path*", "/settings/:path*",
    "/contacts/:path*", "/invoices/:path*", "/proposals/:path*",
    "/contracts/:path*", "/team/:path*", "/time/:path*", "/tasks/:path*",
    "/calendar/:path*", "/finance/:path*", "/pipeline/:path*",
    "/services/:path*", "/scheduler/:path*", "/time-tracker/:path*",
    "/api/notes/:path*", "/api/projects/:path*", "/api/files/:path*",
    "/api/invoices/((?!checkout).*)", "/api/comments/:path*",
    "/api/settings/:path*", "/api/tasks/:path*", "/api/expenses/:path*",
    "/api/contacts/:path*", "/api/bookings/:path*",
    "/api/time-entries/:path*", "/api/notifications/:path*",
  ],
};
