import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { createInvoiceCheckout } from '@/lib/create-invoice-checkout';
export async function POST(req) {
  try {
    const { invoiceId, token } = await req.json();
    if (!invoiceId) return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    return NextResponse.json(await createInvoiceCheckout(db, { invoiceId, token }));
  } catch (err) {
    return NextResponse.json({ error: err.status ? err.message : 'Unable to start checkout. Please try again.' }, { status: err.status || 500 });
  }
}
