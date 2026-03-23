import { getServerSession } from "next-auth";
import { decode } from "next-auth/jwt";
import { authOptions } from "./auth";

/**
 * Returns the current session.
 * Supports both NextAuth cookie sessions (web) and
 * Authorization: Bearer <token> (mobile).
 */
export async function getSession() {
  // Try standard NextAuth cookie session first (web)
  const session = await getServerSession(authOptions);
  if (session) return session;

  // Fall back to Bearer token (mobile)
  // Dynamic import to avoid breaking client component bundles
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const auth = headersList.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.slice(7);
  try {
    const payload = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!payload?.id) return null;

    // Return the same shape as NextAuth session
    return {
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        plan: payload.plan,
        role: payload.role,
        teamRole: payload.teamRole || payload.role,
        permissions: payload.permissions || "",
        companyName: payload.companyName,
        companyLogo: payload.companyLogo,
        timezone: payload.timezone,
        businessId: payload.businessId || null,
      },
    };
  } catch {
    return null;
  }
}
