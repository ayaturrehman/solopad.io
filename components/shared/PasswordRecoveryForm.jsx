"use client";
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
function Form({ reset }) {
  const params = useSearchParams();
  const token = params.get('token');
  const [value, setValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(e) {
    e.preventDefault(); setError('');
    if (reset && value !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/auth/${reset ? 'reset-password' : 'forgot-password'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reset ? { token, password: value } : { email: value }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Please try again.');
      setMessage(data.message);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  return <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4"><div className="w-full max-w-sm rounded border border-zinc-200 bg-white p-6">
    <h1 className="text-2xl font-semibold text-zinc-900">{reset ? 'Choose a new password' : 'Forgot your password?'}</h1>
    {message ? <p role="status" className="mt-4 text-sm text-zinc-700">{message}</p> : reset && !token ? <p role="alert" className="mt-4 text-sm text-red-600">This reset link is missing. <Link href="/forgot-password" className="underline">Request a new link</Link>.</p> : <form onSubmit={submit} className="mt-4 space-y-4">
      <Input label={reset ? 'New password' : 'Email'} type={reset ? 'password' : 'email'} autoComplete={reset ? 'new-password' : 'email'} required minLength={reset ? 8 : undefined} value={value} onChange={e=>setValue(e.target.value)} />
      {reset && <Input label="Confirm new password" type="password" autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)} />}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <Button type="submit" loading={loading}>{reset ? 'Reset password' : 'Send reset link'}</Button>
    </form>}
    <Link href="/login" className="mt-5 block text-sm text-blue-600">Back to sign in</Link>
  </div></main>;
}
export default function PasswordRecoveryForm(props) { return <Suspense fallback={<p>Loading…</p>}><Form {...props}/></Suspense>; }
