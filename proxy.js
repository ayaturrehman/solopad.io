import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/settings/:path*",
    "/contacts/:path*",
    "/invoices/:path*",
    "/proposals/:path*",
    "/contracts/:path*",
    "/team/:path*",
    "/time/:path*",
    "/tasks/:path*",
    "/calendar/:path*",
    "/finance/:path*",
    "/pipeline/:path*",
    "/services/:path*",
    "/scheduler/:path*",
    "/time-tracker/:path*",
    "/api/notes/:path*",
    "/api/projects/:path*",
    "/api/files/:path*",
    "/api/invoices/:path*",
    "/api/comments/:path*",
    "/api/settings/:path*",
    "/api/tasks/:path*",
    "/api/expenses/:path*",
    "/api/contacts/:path*",
    "/api/bookings/:path*",
    "/api/time-entries/:path*",
    "/api/notifications/:path*",
  ],
};
