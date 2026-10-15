"use client";
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
const fields = [['accountName','Account holder name'],['bankName','Bank name'],['sortCode','Sort code'],['accountNumber','Account number'],['iban','IBAN'],['bic','BIC / SWIFT']];
function PaymentsContent({ stripe: initialStripe, paymentMethods, initialBank, stripePaymentsEnabled, existingStripeAvailable }) {
  const query = useSearchParams();
  const [stripe, setStripe] = useState(initialStripe);
  const [online, setOnline] = useState(stripePaymentsEnabled);
  const [bank, setBank] = useState(initialBank.enabled);
  const [details, setDetails] = useState(initialBank.details);
  const [methods, setMethods] = useState(paymentMethods);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/settings/payments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentMethods: methods, stripePaymentsEnabled: online, bankTransferEnabled: bank, bankDetails: details }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Could not save payment settings.');
      setSaved(true);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function disconnect() {
    if (!confirm('Disconnect Stripe from SoloPad? Your Stripe account is kept. Saved bank transfer settings are kept.')) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/settings/stripe/disconnect', { method: 'POST' });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Could not disconnect Stripe.');
      setStripe({ connected: false, onboarded: false });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  function changed() { setSaved(false); }
  return <form onSubmit={save} onChange={changed} className="space-y-6">
    <p className="text-sm text-zinc-500">Accept online payments, bank transfers, or both. These settings apply to client invoices. Your SoloPad subscription is separate.</p>
    {query.get('stripe') === 'error' && <p role="alert" className="text-sm text-red-600">Stripe connection could not be completed. Please retry or contact support.</p>}
    {query.get('stripe') === 'connected' && stripe.onboarded && <p role="status" className="text-sm text-green-700">Stripe connected successfully.</p>}
    <Card><CardHeader><h2 className="font-semibold text-zinc-900">Stripe payments</h2><p className="mt-1 text-sm text-zinc-500">Clients pay online. Verified Stripe payments automatically update your invoices.</p></CardHeader>
      <CardBody className="space-y-4">
        <label className="flex items-center gap-3 text-sm font-medium text-zinc-900"><input type="checkbox" checked={online} onChange={e=>setOnline(e.target.checked)} className="h-4 w-4 accent-zinc-900"/>Enable Stripe payments</label>
        {stripe.connected ? <div className="space-y-3"><p className="text-sm text-zinc-600">{stripe.onboarded ? 'Stripe connected and ready.' : 'Stripe setup is incomplete. Finish onboarding to accept online payments.'}</p>{!stripe.onboarded && <a href="/api/settings/stripe/connect" className="inline-block text-sm font-medium text-blue-600 hover:underline">Complete Stripe setup</a>}<div><Button type="button" variant="secondary" size="sm" onClick={disconnect} disabled={busy}>Disconnect Stripe</Button></div></div> : <div className="space-y-3"><div className="flex flex-wrap gap-3"><a href="/api/settings/stripe/connect" className="inline-flex items-center rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">Set up Stripe payments</a>{existingStripeAvailable && <a href="/api/settings/stripe/oauth" className="inline-flex items-center rounded border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Connect existing Stripe account</a>}</div>{!existingStripeAvailable && <p className="text-sm text-zinc-500">Existing account connections need SoloPad support to finish the Stripe platform setup.</p>}</div>}
        <p className="text-sm text-zinc-500">Stripe processing fees and your plan’s SoloPad platform fee apply. Payout timing is determined by Stripe.</p>
        {online && <fieldset className="space-y-3"><legend className="mb-2 text-sm font-medium text-zinc-700">Online payment methods</legend>{[['card','Card (includes eligible Apple Pay and Google Pay)'],['paypal','PayPal'],['klarna','Klarna']].map(([id,label])=><label key={id} className="flex items-center gap-3 text-sm text-zinc-700"><input type="checkbox" className="h-4 w-4 accent-zinc-900" checked={methods.includes(id)} disabled={id==='card'} onChange={()=>setMethods(prev=>prev.includes(id)?prev.filter(m=>m!==id):[...prev,id])}/>{label}</label>)}<p className="text-xs text-zinc-500">Availability depends on Stripe, your country and the invoice currency.</p></fieldset>}
      </CardBody></Card>
    <Card><CardHeader><h2 className="font-semibold text-zinc-900">Direct bank transfer</h2><p className="mt-1 text-sm text-zinc-500">Clients pay directly to your bank. Record the payment only after you see the funds in your account.</p></CardHeader><CardBody className="space-y-4">
      <label className="flex items-center gap-3 text-sm font-medium text-zinc-900"><input type="checkbox" checked={bank} onChange={e=>setBank(e.target.checked)} className="h-4 w-4 accent-zinc-900"/>Enable bank transfers</label>
      {bank && <><p className="text-sm text-zinc-500">Enter UK sort code and account number, or an IBAN. These details appear on invoices, PDFs and private client payment pages.</p><div className="grid gap-4 sm:grid-cols-2">{fields.map(([key,label])=><Input key={key} label={label} required={key==='accountName'} maxLength={150} value={details[key] || ''} onChange={e=>setDetails({...details,[key]:e.target.value})}/>)}</div><p className="text-sm text-zinc-500">Bank transfers do not require Stripe. SoloPad does not deduct a transaction fee from these transfers; bank fees may apply.</p></>}
    </CardBody></Card>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {saved && <p role="status" className="text-sm text-green-700">Payment settings saved.</p>}
    <Button type="submit" loading={busy}>Save payment settings</Button>
  </form>;
}
export default function PaymentsClient(props) { return <Suspense><PaymentsContent {...props}/></Suspense>; }
