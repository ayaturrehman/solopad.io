# Freelancer payment choices

Freelancers can enable Stripe, direct bank transfer, or both in Settings → Payments. These settings are independent of SoloPad subscription billing.

## Stripe setup

- New accounts: `/api/settings/stripe/connect` uses Express onboarding.
- Existing accounts: `/api/settings/stripe/oauth` authorizes a Standard account on Stripe. No freelancer API keys are collected.
- Set `STRIPE_CONNECT_CLIENT_ID` (the existing `STRIPE_CLIENT_ID` name is also supported), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXTAUTH_SECRET`, and `NEXT_PUBLIC_APP_URL`.
- Register the exact OAuth callback in the matching Stripe Connect test/live application:
  - Local QA: `http://localhost:3110/api/settings/stripe/oauth/callback`
  - Production: `https://www.solopad.io/api/settings/stripe/oauth/callback`
- Use the test client ID with the test secret key. The callback rejects mode mismatches, wrong users, expired/altered state, insufficient scopes, duplicate account ownership and attempts to replace an existing connection.
- Subscribe the platform webhook to checkout completed/async success/async failure/expired, charge refunded/dispute created, account updated and account application deauthorized events. Ensure connected account events are enabled where required by Stripe.
- Standard access is revoked on disconnect. Express accounts are retained; disconnect never deletes a freelancer's Stripe account.
- Existing Standard accounts controlled by another platform may not be eligible for read/write OAuth connections. Stripe makes that eligibility decision.

## Bank transfers

The freelancer enables transfers and saves an account holder name plus UK sort code/account number or a checksum-validated IBAN. Bank name and BIC are optional. Details appear on the private client portal, invoice view and PDF while enabled. Each invoice has an immutable, unique 18-character reference.

The client transfers money outside Stripe. The freelancer records the amount, receipt date and optional bank reference only after confirming funds arrived. No client-side action marks an invoice paid. Partial receipts reduce the remaining balance. Instalment invoices require selection of a milestone. A receipt history retains method, amount, currency, receipt date and recording user.

Stripe checkout and bank receipts lock the same invoice row. Open Stripe links are expired before a balance changes. A completed/processing Stripe payment blocks another receipt until settlement. Already credited payments do not block subsequent milestones. Checkout charges the remaining balance, and verified Stripe settlement uses the same idempotent ledger as the return page. Receipt-backed invoices cannot be edited, reset to unpaid, cancelled or deleted through either invoice API.

## Database rollout

Apply these additive migrations before deploying the new application:

1. `20261015200000_freelancer_payment_choices`
2. `20261015200100_stripe_payment_toggle`
3. `20261015200200_receipt_stripe_reference`

The first migration backfills received amounts for existing paid invoices/milestones. Check for duplicate non-null `User.stripeAccountId` values before rollout; resolve duplicates deliberately rather than dropping the unique index. Back up the database, then run `npx prisma migrate deploy` in the intended environment. Generate the Prisma client as part of the build.

Local verification uses an isolated PostgreSQL-compatible database and Stripe test keys. No migration has been applied to production by this change.

## Rollback

Baseline tag: `qa-before-bank-choices-2026-10-15` (commit `ac26b25`). Every feature/fix is a separate commit.

- Before these features receive production payments, the previous application revision can be redeployed. Keep the additive database columns/tables.
- After bank or mixed receipts exist, prefer reverting a specific UI commit while retaining the payment ledger and balance engine. Review dependencies before reverting schema or accounting commits.
- Do not deploy the pre-ledger checkout after partial receipts have been recorded: it would charge the original invoice total. A full downgrade requires blocking invoice checkout at the routing layer first and reconciling balances before reopening payments.
- Never drop payment history as a rollback step. A code revert does not reverse bank transfers or Stripe transactions.

## Verification limits

The local Stripe OAuth redirect was rejected because the new callback URL is not registered in the platform application. Positive callback/state/ownership/mode cases are covered by automated tests; full Stripe consent remains pending that configuration.

Bank transfers are manually reconciled; automated bank feeds and virtual bank accounts are not included. Stripe test-mode card checkout, mixed receipts, milestones, declines, cancellation and signed webhook replay are checked separately from OAuth consent. Wallet-specific flows and 3DS challenges are not newly certified by this change. Refund state is tracked; retained net revenue after partial refunds remains a separate accounting follow-up.
