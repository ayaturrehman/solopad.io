"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { remainingMilestoneAmount } from '@/lib/invoice-receipts';
export default function BankPaymentForm({ invoiceId, currency, remaining, enabled, status, milestones, payments }) {
  const router = useRouter();
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [requestId,setRequestId] = useState(null);
  const [amount,setAmount] = useState('');
  const [milestone,setMilestone] = useState('');
  async function record(event) {
    event.preventDefault(); setBusy(true); setError('');
    const data = new FormData(event.currentTarget);
    const key = requestId || crypto.randomUUID(); setRequestId(key);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ amount, milestoneId: milestone || null, receivedAt: data.get('receivedAt'), reference: data.get('reference'), confirmed: data.get('confirmed') === 'on', idempotencyKey: key }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not record payment.');
      setAmount(''); setRequestId(null); router.refresh();
    } catch(err) { setError(err.message); } finally {setBusy(false);}
  }
  const payable = !['draft','paid','cancelled','refunded','partially_refunded'].includes(status) && remaining > 0;
  return <section className="surface-card mb-6 space-y-4 rounded bg-white p-5" aria-label="Payment records"><h2 className="font-semibold text-zinc-900">Payments · {formatCurrency(remaining, currency)} remaining</h2>
    {payable && enabled && <form onSubmit={record} className="space-y-4"><p className="text-sm text-zinc-500">Record a bank transfer only after the funds arrive. This updates the remaining balance and keeps a payment history.</p><div className="grid gap-4 sm:grid-cols-2">{milestones.length > 0 && <Select label="Milestone" value={milestone} required onChange={e=>{setMilestone(e.target.value);setRequestId(null);}}><option value="">Choose milestone</option>{milestones.filter(m=>m.status!=='paid').map(m=><option key={m.id} value={m.id}>{m.label || 'Milestone'} · {formatCurrency(remainingMilestoneAmount(m), currency)} remaining</option>)}</Select>}<Input label={`Amount received (${currency})`} type="number" step="any" min="0.001" max={remaining} required value={amount} onChange={e=>{setAmount(e.target.value);setRequestId(null);}}/><Input label="Date received" name="receivedAt" onChange={()=>setRequestId(null)} type="date" required max={new Date().toISOString().slice(0,10)} defaultValue={new Date().toISOString().slice(0,10)}/><Input label="Bank reference (optional)" name="reference" onChange={()=>setRequestId(null)} maxLength={150}/></div><label className="flex items-start gap-3 text-sm text-zinc-700"><input name="confirmed" type="checkbox" required className="mt-0.5 h-4 w-4 accent-zinc-900"/>I have checked my bank account and received these funds.</label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<Button type="submit" loading={busy}>Record bank payment</Button></form>}
    {payable && !enabled && <Link href="/settings/payments" className="text-sm text-blue-600 hover:underline">Enable bank transfers in payment settings</Link>}
    {payments.length > 0 && <ul className="space-y-3 text-sm text-zinc-600">{payments.map(p=><li key={p.id} className="flex flex-wrap justify-between gap-2"><span>{formatDate(p.receivedAt)} · {p.method==='bank_transfer'?'Bank transfer':'Stripe'}{p.reference ? ` · ${p.reference}` : ''}</span><strong className="text-zinc-900">{formatCurrency(p.amount,currency)}</strong></li>)}</ul>}
  </section>;
}
