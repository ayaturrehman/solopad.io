import { invoicePaymentAmount } from "./invoice-payment";
export function receivedInvoiceAmount(invoice) {
  if (invoice.amountPaid !== undefined) return Number(invoice.amountPaid || 0);
  if (invoice.status === "paid") return Number(invoice.total || 0);
  return (invoice.paymentPlans || [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);
}
export function remainingInvoiceAmount(invoice) {
  return Math.max(
    0,
    Math.round((Number(invoice.total) - receivedInvoiceAmount(invoice)) * 1e6) /
      1e6,
  );
}
export function remainingMilestoneAmount(plan) {
  return plan.status === "paid"
    ? 0
    : Math.max(
        0,
        Math.round((Number(plan.amount) - Number(plan.amountPaid || 0)) * 1e6) /
          1e6,
      );
}
export function paymentError(message, status = 409) {
  return Object.assign(new Error(message), { status });
}
export async function withInvoiceLock(db, invoiceId, action) {
  return db.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Invoice" WHERE id = ${invoiceId} FOR UPDATE`;
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          paymentPlans: true,
          project: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  businessId: true,
                  plan: true,
                  stripeAccountId: true,
                  stripeOnboarded: true,
                  stripePaymentsEnabled: true,
                  bankTransferEnabled: true,
                  paymentMethods: true,
                },
              },
              contact: { select: { name: true, email: true } },
            },
          },
        },
      });
      if (!invoice) throw paymentError("Invoice not found.", 404);
      return action(tx, invoice);
    },
    { timeout: 30000, maxWait: 10000 },
  );
}
export function requirePayable(invoice) {
  if (
    ["draft", "paid", "cancelled", "refunded", "partially_refunded"].includes(
      invoice.status,
    ) ||
    remainingInvoiceAmount(invoice) <= 0
  )
    throw paymentError("Invoice is not available for payment.", 400);
}
// Hold the same invoice lock for Stripe checkout and manual receipts. Expire
// open links before changing the balance; completed/pending payments must settle.
export async function retireInvoiceCheckouts(tx, invoice, stripe) {
  const pending = await tx.invoicePayment.findMany({
    where: { invoiceId: invoice.id, method: "stripe", status: "pending" },
  });
  const lastReceipt = invoice.stripeSessionId
    ? await tx.invoicePayment.findUnique({
        where: { stripeSessionId: invoice.stripeSessionId },
      })
    : null;
  const ids = [
    ...new Set(
      [
        // A paid receipt has already been credited. It must not block the next
        // milestone or bank transfer. Only untracked legacy links need this check.
        ...(!lastReceipt && invoice.stripeSessionId
          ? [invoice.stripeSessionId]
          : []),
        ...pending.map((p) => p.stripeSessionId),
      ].filter(Boolean),
    ),
  ];
  for (const id of ids) {
    if (!stripe)
      throw paymentError(
        "Stripe is required to check an outstanding payment link.",
      );
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(id);
    } catch (err) {
      if (err.code !== "resource_missing") throw err;
    }
    if (session?.payment_status === "paid" || session?.status === "complete")
      throw paymentError(
        "A Stripe payment is received or processing. Wait for it to finish before recording another payment.",
      );
    if (session?.status === "open") await stripe.checkout.sessions.expire(id);
    await tx.invoicePayment.updateMany({
      where: { stripeSessionId: id, status: "pending" },
      data: { status: "expired" },
    });
  }
  if (invoice.stripeSessionId)
    await tx.invoice.update({
      where: { id: invoice.id },
      data: { stripeSessionId: null },
    });
}
export async function applyReceipt(
  tx,
  invoice,
  { amount, milestoneId, receivedAt, paymentIntentId },
) {
  const paidAmount = receivedInvoiceAmount(invoice) + amount;
  const paid = Math.abs(Number(invoice.total) - paidAmount) < 0.000001;
  if (paidAmount > Number(invoice.total) + 0.000001)
    throw paymentError("Payment exceeds the remaining invoice balance.");
  if (milestoneId) {
    const plan = invoice.paymentPlans.find((p) => p.id === milestoneId);
    if (!plan || amount > remainingMilestoneAmount(plan) + 0.000001)
      throw paymentError("Payment exceeds the remaining milestone balance.");
    const planPaid =
      Math.abs(remainingMilestoneAmount(plan) - amount) < 0.000001;
    await tx.paymentPlan.update({
      where: { id: milestoneId },
      data: {
        amountPaid: Number(plan.amountPaid || 0) + amount,
        ...(planPaid ? { status: "paid", paidAt: receivedAt } : {}),
      },
    });
  } else if (paid && invoice.paymentPlans.length) {
    for (const plan of invoice.paymentPlans)
      await tx.paymentPlan.update({
        where: { id: plan.id },
        data: { amountPaid: plan.amount, status: "paid", paidAt: receivedAt },
      });
  }
  return tx.invoice.update({
    where: { id: invoice.id },
    data: {
      amountPaid: paidAmount,
      ...(paid ? { status: "paid", paidAt: receivedAt } : {}),
      ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
    },
  });
}
export async function settleStripeReceipt(db, session) {
  if (session.payment_status !== "paid" || !session.metadata?.invoiceId)
    return null;
  return withInvoiceLock(
    db,
    session.metadata.invoiceId,
    async (tx, invoice) => {
      const existing = await tx.invoicePayment.findUnique({
        where: { stripeSessionId: session.id },
      });
      if (existing?.status === "paid") return null;
      if (!existing && invoice.status === "paid") return null; // legacy paid invoice
      const milestoneId = session.metadata.milestoneId || null;
      const plan = milestoneId
        ? invoice.paymentPlans.find((p) => p.id === milestoneId)
        : null;
      if (milestoneId && !plan) throw paymentError("Milestone not found.");
      if (!existing && plan?.status === "paid") return null; // legacy receipt
      const total =
        existing?.amount ??
        (plan
          ? remainingMilestoneAmount(plan)
          : remainingInvoiceAmount(invoice));
      const expected = invoicePaymentAmount({
        total,
        currency: invoice.currency,
      });
      if (
        session.amount_total !== expected.amount ||
        session.currency !== expected.currency
      )
        throw paymentError(
          "Stripe receipt does not match the invoice balance.",
        );
      const receivedAt = new Date();
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      if (existing)
        await tx.invoicePayment.update({
          where: { id: existing.id },
          data: { status: "paid", receivedAt, stripePaymentIntentId: paymentIntentId },
        });
      else
        await tx.invoicePayment.create({
          data: {
            invoiceId: invoice.id,
            milestoneId,
            method: "stripe",
            amount: total,
            currency: invoice.currency,
            stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
            idempotencyKey: session.id,
            receivedAt,
          },
        });
      const updated = await applyReceipt(tx, invoice, {
        amount: total,
        milestoneId,
        receivedAt,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id,
      });
      return { ...updated, project: invoice.project };
    },
  );
}
