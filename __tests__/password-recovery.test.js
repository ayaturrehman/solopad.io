import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({ find: vi.fn(), update: vi.fn(), send: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: { user: { findUnique: m.find, updateMany: m.update } } }));
vi.mock('@/lib/rate-limit', () => ({ registerLimiter: { check: () => ({ success: true }) }, authLimiter: { check: () => ({ success: true }) } }));
vi.mock('resend', () => ({ Resend: class { constructor() { this.emails = { send: m.send }; } } }));
import { POST as forgot } from '@/app/api/auth/forgot-password/route';
import { POST as reset } from '@/app/api/auth/reset-password/route';
import { createPasswordReset } from '@/lib/password-reset';
const user = { id: 'u', email: 'test@example.test', password: 'original-password-hash' };
const request = body => new Request('http://localhost/api/auth/reset', { method: 'POST', body: JSON.stringify(body) });
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv('NEXTAUTH_SECRET', 'test-secret'); vi.stubEnv('RESEND_API_KEY', 'test-key'); vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3100');
  m.find.mockResolvedValue(user); m.send.mockResolvedValue({ data: { id: 'mock-mail' } }); m.update.mockResolvedValue({ count: 1 });
});
afterEach(() => vi.unstubAllEnvs());
it('returns the same public response for known and unknown emails', async () => {
  const known = await (await forgot(request({ email: user.email }))).json();
  m.find.mockResolvedValue(null);
  const unknown = await (await forgot(request({ email: 'unknown@example.test' }))).json();
  expect(known).toEqual(unknown); expect(m.send).toHaveBeenCalledTimes(1);
});
it('checks token authenticity before changing any password', async () => {
  expect((await reset(request({ token: 'bad', password: 'New-Password-2026!' }))).status).toBe(400);
  expect(m.update).not.toHaveBeenCalled();
});
it('atomically replaces the password and rejects a concurrent reused token', async () => {
  const token = createPasswordReset(user);
  expect((await reset(request({ token, password: 'New-Password-2026!' }))).status).toBe(200);
  expect(m.update.mock.calls[0][0].where).toEqual({ id: user.id, password: user.password });
  expect(m.update.mock.calls[0][0].data.password).not.toBe('New-Password-2026!');
  m.update.mockResolvedValue({ count: 0 });
  expect((await reset(request({ token, password: 'New-Password-2026!' }))).status).toBe(400);
});
