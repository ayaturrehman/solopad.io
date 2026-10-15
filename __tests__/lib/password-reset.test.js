import { afterEach, expect, it, vi } from 'vitest';
import { createPasswordReset, verifyPasswordReset } from '@/lib/password-reset';
afterEach(() => vi.unstubAllEnvs());
it('expires, rejects tampering and becomes invalid after the password changes', () => {
  vi.stubEnv('NEXTAUTH_SECRET', 'test-secret');
  const user = { id: 'u', password: 'hash-before' };
  const token = createPasswordReset(user, 1000);
  expect(verifyPasswordReset(token, user, 2000)).toBe(true);
  expect(verifyPasswordReset(token, user, 1801000)).toBe(false);
  expect(verifyPasswordReset(token+'x', user, 2000)).toBe(false);
  expect(verifyPasswordReset(token, { ...user, password: 'hash-after' }, 2000)).toBe(false);
  expect(verifyPasswordReset(token, { ...user, id: 'other' }, 2000)).toBe(false);
});
