ALTER TABLE "InvoicePayment" ADD COLUMN "stripePaymentIntentId" TEXT;
CREATE UNIQUE INDEX "InvoicePayment_stripePaymentIntentId_key" ON "InvoicePayment"("stripePaymentIntentId");
