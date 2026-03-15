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
    "/api/notes/:path*",
    "/api/projects/:path*",
    "/api/files/:path*",
    "/api/invoices/:path*",
    "/api/comments/:path*",
    "/api/settings/:path*",
  ],
};
