import Link from 'next/link';
import { CheckCircle, Clock } from 'lucide-react';
import { confirmInvoicePayment } from '@/lib/payment-confirmation';
import { safePaymentReturn } from '@/lib/payment-return';

export default async function PaymentSuccessPage({ searchParams }) {
  const { invoiceId, milestone, session_id: sessionId, returnTo } = await searchParams;
  const paid = await confirmInvoicePayment(invoiceId, milestone, sessionId);
  const returnPath = safePaymentReturn(returnTo);
  const Icon = paid ? CheckCircle : Clock;
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{paid ? 'Payment successful' : 'Payment not confirmed'}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          {paid ? 'Thank you. Your payment has been received and your invoice is updated.' : 'We could not confirm a completed payment. Check your invoice before trying again to avoid a duplicate payment.'}
        </p>
        <Link href={returnPath || '/'} className="mt-6 inline-flex min-h-11 items-center justify-center rounded bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-700">
          {returnPath ? 'Return to invoice' : 'Return to SoloPad'}
        </Link>
      </div>
    </div>
  );
}
