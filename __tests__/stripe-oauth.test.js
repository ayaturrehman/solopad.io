import { describe, it, expect, vi } from 'vitest';
import { createOAuthState, validOAuthState } from '../lib/stripe-oauth';
describe('Stripe OAuth state', () => {
  it('binds a short-lived state to both user and cookie', () => {
    const state = createOAuthState('owner', 'secret');
    expect(validOAuthState(state, state, 'owner', 'secret')).toBe(true);
    expect(validOAuthState(state, state, 'other', 'secret')).toBe(false);
    expect(validOAuthState(state, 'different', 'owner', 'secret')).toBe(false);
    expect(validOAuthState(state, state, 'owner', 'wrong-secret')).toBe(false);
    expect(validOAuthState(state+'tampered', state+'tampered', 'owner', 'secret')).toBe(false);
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 601000);
    expect(validOAuthState(state, state, 'owner', 'secret')).toBe(false);
    vi.restoreAllMocks();
  });
});
