-- Additive migration. Existing receipts are retained when reverting app code.
CREATE UNIQUE INDEX "User_stripeAccountId_key" ON "User"("stripeAccountId");
ALTER TABLE "User" ADD COLUMN "bankTransferEnabled" BOOLEAN NOT NULL DEFAULT false, ADD COLUMN "bankDetails" JSONB;
ALTER TABLE "Invoice" ADD COLUMN "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "PaymentPlan" ADD COLUMN "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0;
UPDATE "PaymentPlan" SET "amountPaid" = "amount" WHERE "status" = 'paid';
UPDATE "Invoice" SET "amountPaid" = "total" WHERE "status" IN ('paid', 'refunded', 'partially_refunded');
UPDATE "Invoice" i SET "amountPaid" = COALESCE((SELECT SUM(p."amountPaid") FROM "PaymentPlan" p WHERE p."invoiceId" = i.id), 0) WHERE i.status NOT IN ('paid', 'refunded', 'partially_refunded');
CREATE TABLE "InvoicePayment" (
 "id" TEXT NOT NULL PRIMARY KEY, "invoiceId" TEXT NOT NULL, "milestoneId" TEXT,
 "method" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'paid', "amount" DOUBLE PRECISION NOT NULL,
 "currency" TEXT NOT NULL, "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "reference" TEXT, "recordedById" TEXT, "idempotencyKey" TEXT NOT NULL, "stripeSessionId" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "InvoicePayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "InvoicePayment_idempotencyKey_key" ON "InvoicePayment"("idempotencyKey");
CREATE UNIQUE INDEX "InvoicePayment_stripeSessionId_key" ON "InvoicePayment"("stripeSessionId");
CREATE INDEX "InvoicePayment_invoiceId_status_idx" ON "InvoicePayment"("invoiceId", "status");
