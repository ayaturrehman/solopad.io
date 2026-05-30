/**
 * Authoritative access control for subscriptions, trials, and plan features.
 *
 * Everything here reads the live database — never the JWT — so that plan
 * downgrades, cancellations, expired trials, and revoked team membership take
 * effect immediately rather than waiting for a (potentially 30-day) token to
 * expire. The JWT is treated as identity only.
 */

import { getSession } from "./session";
import db from "./db";
import { parsePermissions } from "./team";
import { normalizePlan, planHasFeature, getMinPlanForFeature, getPlan } from "./plans";

/**
 * Decide whether a subscription record permits access to the product.
 *
 * Rules (kept in sync with app/(app)/layout.jsx):
 *  - No subscription record at all  → allowed (legacy / onboarding users).
 *  - status === "active"            → allowed.
 *  - status === "trialing" AND trialEnd in the future → allowed.
 *  - anything else (past_due, canceled, incomplete, expired trial) → blocked.
 */
export function isSubscriptionUsable(subscription) {
  if (!subscription) return true; // legacy users with no Subscription row
  if (subscription.status === "active") return true;
  if (
    subscription.status === "trialing" &&
    subscription.trialEnd &&
    new Date(subscription.trialEnd) > new Date()
  ) {
    return true;
  }
  return false;
}

/**
 * Load the authoritative access context for the current request from the DB.
 *
 * Returns either:
 *   { error, status }                          — on auth failure
 *   { session, userId, businessId, isOwner,
 *     permissions: string[], plan,
 *     subscription, subscriptionUsable }       — on success
 */
export async function loadAccess(session) {
  const activeSession = session ?? (await getSession());
  if (!activeSession?.user?.id && !activeSession?.user?.email) {
    return { error: "Unauthorized", status: 401 };
  }

  const where = activeSession.user.id
    ? { id: activeSession.user.id }
    : { email: activeSession.user.email };

  const user = await db.user.findUnique({
    where,
    select: {
      id: true,
      role: true,
      businessId: true,
      plan: true,
      business: {
        select: {
          ownerId: true,
          plan: true,
          subscription: {
            select: { status: true, trialEnd: true, plan: true },
          },
        },
      },
    },
  });

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  // Authoritative team membership (role + granular permissions).
  let teamMember = null;
  if (user.businessId) {
    teamMember = await db.teamMember.findFirst({
      where: { userId: user.id, businessId: user.businessId, status: "active" },
      select: { role: true, permissions: true },
    });
  }

  const isOwner =
    user.role === "owner" ||
    user.business?.ownerId === user.id ||
    teamMember?.role === "owner";

  const permissions = parsePermissions(teamMember?.permissions);

  const subscription = user.business?.subscription ?? null;
  const plan = normalizePlan(user.business?.plan ?? subscription?.plan ?? user.plan);

  return {
    session: activeSession,
    userId: user.id,
    businessId: user.businessId ?? null,
    isOwner,
    permissions,
    plan,
    subscription,
    subscriptionUsable: isSubscriptionUsable(subscription),
  };
}

const SUBSCRIPTION_BLOCKED_MESSAGE =
  "Your subscription has ended. Subscribe to a plan to continue using SoloPad.";

/**
 * Require an authenticated user with a usable subscription.
 * Does NOT check granular permissions (use requirePermission for that).
 *
 * @param {object} [options]
 * @param {object} [options.session]  pre-resolved session, if available
 * @returns { session, access } on success, or { error, status } on failure
 */
export async function requireActiveSubscription(options = {}) {
  const access = options.access ?? (await loadAccess(options.session));
  if (access.error) return { error: access.error, status: access.status };

  if (!access.subscriptionUsable) {
    return { error: SUBSCRIPTION_BLOCKED_MESSAGE, status: 402 };
  }

  return { session: access.session, access };
}

/**
 * Require an authenticated user whose plan unlocks `feature` AND whose
 * subscription is usable. Use in routes that gate premium functionality.
 *
 * @returns { session, access } on success, or { error, status } on failure
 */
export async function requireFeature(feature, options = {}) {
  const result = await requireActiveSubscription(options);
  if (result.error) return result;

  const { access } = result;
  if (!planHasFeature(access.plan, feature)) {
    const minPlan = getMinPlanForFeature(feature);
    const planName = getPlan(minPlan)?.name || "a higher";
    return {
      error: `This feature requires the ${planName} plan or higher. Upgrade to unlock it.`,
      status: 403,
    };
  }

  return { session: access.session, access };
}
