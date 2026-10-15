import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/permissions';
import { requireStripe } from '@/lib/stripe';
import { validOAuthState, OAUTH_COOKIE } from '@/lib/stripe-oauth';
import db from '@/lib/db';
export async function GET(req) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  function finish(result) {
    const response = NextResponse.redirect(`${appUrl}/settings/payments?stripe=${result}`);
    response.cookies.set(OAUTH_COOKIE, '', { httpOnly: true, secure: appUrl.startsWith('https:'), sameSite: 'lax', maxAge: 0, path: '/api/settings/stripe/oauth' });
    return response;
  }
  const { session, error, status } = await requirePermission('manage_settings');
  if (error) return NextResponse.json({ error }, { status });
  const query = new URL(req.url).searchParams;
  if (!validOAuthState(query.get('state'), req.cookies.get(OAUTH_COOKIE)?.value, session.user.id, process.env.NEXTAUTH_SECRET)) return finish('error');
  if (query.has('error') || !query.get('code')) return finish('error');
  try {
    const stripe = requireStripe();
    const token = await stripe.oauth.token({ grant_type: 'authorization_code', code: query.get('code') });
    if (token.livemode !== !process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || token.scope !== 'read_write') return finish('error');
    const account = await stripe.accounts.retrieve(token.stripe_user_id);
    if (account.type !== 'standard') return finish('error');
    const duplicate = await db.user.findFirst({ where: { stripeAccountId: account.id, id: { not: session.user.id } }, select: { id: true } });
    if (duplicate) return finish('error');
    const updated = await db.user.updateMany({ where: { id: session.user.id, stripeAccountId: null }, data: { stripeAccountId: account.id, stripeOnboarded: !!(account.charges_enabled && account.payouts_enabled) } });
    if (!updated.count) return finish('error');
    return finish(account.charges_enabled && account.payouts_enabled ? 'connected' : 'incomplete');
  } catch (err) {
    console.error('[Stripe OAuth]', err.type || 'connection_failed');
    return finish('error');
  }
}
