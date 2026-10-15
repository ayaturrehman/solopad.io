import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export const OAUTH_COOKIE = 'solopad-stripe-oauth';
export function createOAuthState(userId, secret) {
  if (!secret) throw new Error('Authentication secret is not configured.');
  const payload = Buffer.from(JSON.stringify({ userId, expires: Date.now() + 600000, nonce: randomBytes(32).toString('hex') })).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}
export function validOAuthState(state, cookie, userId, secret) {
  try {
    if (!secret || !state || state !== cookie) return false;
    const [payload, signature, extra] = state.split('.');
    if (extra || !signature) return false;
    const actual = Buffer.from(signature, 'base64url');
    const expected = createHmac('sha256', secret).update(payload).digest();
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.userId === userId && data.expires > Date.now();
  } catch { return false; }
}
