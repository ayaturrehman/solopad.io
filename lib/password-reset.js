import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

function sign(payload, passwordHash) {
  if (!process.env.NEXTAUTH_SECRET) throw new Error('Authentication secret is not configured');
  return createHmac('sha256', `${process.env.NEXTAUTH_SECRET}:${passwordHash}`).update(payload).digest('base64url');
}
export function createPasswordReset(user, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ id: user.id, expires: now + 30 * 60 * 1000, nonce: randomBytes(24).toString('base64url') })).toString('base64url');
  return `${payload}.${sign(payload, user.password)}`;
}
export function readPasswordReset(token) {
  try {
    if (typeof token !== 'string' || token.length > 2048) return null;
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof data.id !== 'string' || !Number.isFinite(data.expires)) return null;
    return { ...data, payload, signature };
  } catch { return null; }
}
export function verifyPasswordReset(token, user, now = Date.now()) {
  const data = readPasswordReset(token);
  if (!data || data.id !== user.id || data.expires <= now) return false;
  const expected = Buffer.from(sign(data.payload, user.password));
  const actual = Buffer.from(data.signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
