import { expect, it } from 'vitest';
import { formatCurrencyTotals } from '@/lib/utils';
it('keeps different invoice currencies separate', () => {
  const text = formatCurrencyTotals([{ total: 2543.34, currency: 'USD' }, { total: 20, currency: 'GBP' }, { total: 10, currency: 'USD' }]);
  expect(text).toContain('US$2,553.34'); expect(text).toContain('£20.00'); expect(text).not.toContain('£2,573.34');
});
it('does not invent a currency for an empty balance', () => { expect(formatCurrencyTotals([])).toBe('—'); });
