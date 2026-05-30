/**
 * Stripe webhook idempotency helpers.
 *
 * Stripe delivers each event at least once and retries on failure, and events
 * can be manually re-sent from the dashboard. These helpers let a webhook skip
 * an event it has already fully processed, so retries/re-sends can't
 * double-apply side effects.
 *
 * Design notes:
 *  - We record an event as processed only AFTER it is handled successfully, so
 *    a failed handler can still be retried/re-sent.
 *  - Every DB call fails OPEN (treats the event as not-yet-processed and lets
 *    handling continue) so that a missing table during a rollout, or a transient
 *    DB error, never blocks legitimate webhook processing.
 */

import db from "./db";

/**
 * Returns true if this event id was already handled successfully.
 * Fails open (returns false) on any error.
 */
export async function isEventProcessed(eventId) {
  if (!eventId) return false;
  try {
    const existing = await db.processedWebhookEvent.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    return !!existing;
  } catch (err) {
    console.error("[Webhook] idempotency lookup failed (continuing):", err.message);
    return false;
  }
}

/**
 * Mark an event id as successfully handled. Best-effort; never throws.
 */
export async function markEventProcessed(eventId, { type = null, source = null } = {}) {
  if (!eventId) return;
  try {
    await db.processedWebhookEvent.create({
      data: { id: eventId, type, source },
    });
  } catch (err) {
    // P2002 = already recorded (concurrent duplicate) — that's fine.
    if (err?.code !== "P2002") {
      console.error("[Webhook] could not record processed event (continuing):", err.message);
    }
  }
}
