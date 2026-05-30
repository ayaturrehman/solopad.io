import { parsePermissions } from "./team";
import { loadAccess, isSubscriptionUsable } from "./subscription";

const SUBSCRIPTION_BLOCKED_MESSAGE =
  "Your subscription has ended. Subscribe to a plan to continue using SoloPad.";

/**
 * Check if the current request has the required permission.
 *
 * Authorisation is resolved from the DATABASE (role, granular permissions,
 * subscription status) rather than the JWT, so downgrades, cancellations,
 * expired trials, and revoked membership take effect immediately.
 *
 * By default this also enforces a usable subscription. Routes that must remain
 * reachable while a subscription is lapsed (e.g. billing) pass
 * `{ skipSubscriptionCheck: true }` so the user can resubscribe.
 *
 * Returns { session, access } on success, or { error, status } on failure.
 *
 * Usage in API routes:
 *   const { session, error, status } = await requirePermission("manage_contacts");
 *   if (error) return NextResponse.json({ error }, { status });
 */
export async function requirePermission(permission, options = {}) {
  const access = await loadAccess(options.session);
  if (access.error) return { error: access.error, status: access.status };

  if (!options.skipSubscriptionCheck && !access.subscriptionUsable) {
    return { error: SUBSCRIPTION_BLOCKED_MESSAGE, status: 402 };
  }

  if (!access.isOwner && !access.permissions.includes(permission)) {
    return { error: "You don't have permission to do this", status: 403 };
  }

  return { session: access.session, access };
}

/**
 * Check if the current request has ANY of the listed permissions.
 * Useful for routes that serve multiple roles (e.g., GET that needs view_x OR manage_x).
 */
export async function requireAnyPermission(...permissionList) {
  // Allow an options object as the final argument.
  let options = {};
  if (
    permissionList.length &&
    typeof permissionList[permissionList.length - 1] === "object"
  ) {
    options = permissionList.pop();
  }

  const access = await loadAccess(options.session);
  if (access.error) return { error: access.error, status: access.status };

  if (!options.skipSubscriptionCheck && !access.subscriptionUsable) {
    return { error: SUBSCRIPTION_BLOCKED_MESSAGE, status: 402 };
  }

  if (access.isOwner) return { session: access.session, access };

  const hasAny = permissionList.some((p) => access.permissions.includes(p));
  if (!hasAny) {
    return { error: "You don't have permission to do this", status: 403 };
  }

  return { session: access.session, access };
}

/**
 * Client-side permission check (synchronous).
 * Use in components to show/hide UI elements. This trusts the session object
 * for UX only — never rely on it for authorisation (the server re-checks).
 *
 * Usage:
 *   const canEdit = checkPermission(session, "manage_contacts");
 */
export function checkPermission(session, permission) {
  if (!session?.user) return false;
  if (session.user.role === "owner" || session.user.teamRole === "owner") return true;
  return parsePermissions(session.user.permissions).includes(permission);
}

export { isSubscriptionUsable };
