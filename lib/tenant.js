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

// Per-request cache to avoid repeated DB lookups for the same user
// in a single server-side render (multiple API calls share the same request)
const _tenantCache = new Map();

export async function resolveTenantUser(session) {
  if (!session?.user) return null;

  const cacheKey = session.user.id || session.user.email;
  if (cacheKey && _tenantCache.has(cacheKey)) {
    return _tenantCache.get(cacheKey);
  }

  let result = null;

  if (session.user.id) {
    result = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, businessId: true },
    });
  }

  if (!result && session.user.email) {
    result = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, businessId: true },
    });
  }

  if (cacheKey && result) _tenantCache.set(cacheKey, result);
  return result;
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

  return {
    userId: user?.id ?? session.user.id,
    ...(user?.businessId ? { businessId: user.businessId } : { userId: user?.id ?? session.user.id }),
  };
}
