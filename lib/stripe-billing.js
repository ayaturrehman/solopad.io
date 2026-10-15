// Support both older Stripe payloads and the item/parent fields in Clover.
export function getSubscriptionPeriod(subscription) {
  const item = subscription.items?.data?.[0];
  return {
    start: subscription.current_period_start ?? item?.current_period_start,
    end: subscription.current_period_end ?? item?.current_period_end,
  };
}

export function getInvoiceSubscriptionId(invoice) {
  const subscription = invoice.subscription ?? invoice.parent?.subscription_details?.subscription;
  return typeof subscription === "string" ? subscription : subscription?.id;
}
