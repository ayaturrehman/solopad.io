import { NextResponse } from "next/server";
import { getSession } from "./session";
import { parsePermissions } from "./team";

/**
 * Check if the current session user has the required permission.
 * Returns { session } on success, or { error, status } on failure.
 *
 * Usage in API routes:
 *   const { session, error, status } = await requirePermission("manage_contacts");
 *   if (error) return NextResponse.json({ error }, { status });
 */
export async function requirePermission(permission) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  // Owners always have all permissions
  if (session.user.role === "owner" || session.user.teamRole === "owner") {
    return { session };
  }

  const permissions = parsePermissions(session.user.permissions);
  if (!permissions.includes(permission)) {
    return { error: "You don't have permission to do this", status: 403 };
  }

  return { session };
}

/**
 * Check if the current session user has ANY of the listed permissions.
 * Useful for routes that serve multiple roles (e.g., GET that needs view_x OR manage_x).
 */
export async function requireAnyPermission(...permissionList) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  if (session.user.role === "owner" || session.user.teamRole === "owner") {
    return { session };
  }

  const permissions = parsePermissions(session.user.permissions);
  const hasAny = permissionList.some((p) => permissions.includes(p));
  if (!hasAny) {
    return { error: "You don't have permission to do this", status: 403 };
  }

  return { session };
}

/**
 * Client-side permission check (synchronous).
 * Use in components to show/hide UI elements.
 *
 * Usage:
 *   const canEdit = checkPermission(session, "manage_contacts");
 */
export function checkPermission(session, permission) {
  if (!session?.user) return false;
  if (session.user.role === "owner" || session.user.teamRole === "owner") return true;
  return parsePermissions(session.user.permissions).includes(permission);
}
