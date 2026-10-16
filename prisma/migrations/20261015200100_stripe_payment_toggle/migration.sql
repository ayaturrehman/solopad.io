ALTER TABLE "User" ADD COLUMN "stripePaymentsEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Invoice" ADD COLUMN "paymentReference" TEXT NOT NULL DEFAULT ('SP-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 15));
CREATE UNIQUE INDEX "Invoice_paymentReference_key" ON "Invoice"("paymentReference");
