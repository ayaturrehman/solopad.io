import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { createInvoiceCheckout } from '@/lib/create-invoice-checkout';
export async function POST(req, { params }) {
  try {
    const { id: invoiceId } = await params;
    const { milestoneId, token } = await req.json();
    if (!milestoneId) return NextResponse.json({ error: 'milestoneId is required.' }, { status: 400 });
    return NextResponse.json(await createInvoiceCheckout(db, { invoiceId, milestoneId, token }));
  } catch (err) {
    return NextResponse.json({ error: err.status ? err.message : 'Unable to start checkout. Please try again.' }, { status: err.status || 500 });
  }
}
