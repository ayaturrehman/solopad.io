/**
 * Multi-tenancy scoping helper.
 *
 * Returns a Prisma WHERE filter that scopes queries to the correct tenant.
 *
 * - If the user belongs to a Business → filter by `businessId`
 *   (all team members of the same business see the same data)
 * - If no Business yet (solo user / onboarding) → filter by `userId`
 *   (backwards-compatible, works for all existing data)
 *
 * Usage:
 *   const filter = await getTenantFilter(session);
 *   const services = await db.service.findMany({ where: filter });
 */

import db from "@/lib/db";

export async function resolveTenantUser(session) {
  if (!session?.user) return null;

  if (session.user.id) {
    const userById = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, businessId: true },
    });

    if (userById) return userById;
  }

  if (session.user.email) {
    const userByEmail = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, businessId: true },
    });

    if (userByEmail) return userByEmail;
  }

  return null;
}

export async function getTenantFilter(session) {
  if (!session?.user?.id) return null;

  const user = await resolveTenantUser(session);

  if (user?.businessId) {
    return { businessId: user.businessId };
  }

  // Fallback — solo user, no business yet
  return { userId: user?.id ?? session.user.id };
}

/**
 * Returns the tenant scope as { businessId } or { userId } for use in
 * `create` data payloads so new records are always stamped with the tenant.
 */
export async function getTenantData(session) {
  const user = await resolveTenantUser(session);
  const filter = await getTenantFilter(session);
  return {
    userId: user?.id ?? session.user.id,   // always stamp userId for ownership tracking
    ...filter,                  // also stamp businessId if available
  };
}
