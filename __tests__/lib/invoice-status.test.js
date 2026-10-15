import { expect, it } from 'vitest';
import { isOutstandingInvoice } from '@/lib/invoice-status';
it('counts issued unpaid money without treating drafts or closed invoices as due',()=>{
 const invoices=[{status:'sent',total:100},{status:'draft',total:1000},{status:'paid',total:50},{status:'cancelled',total:200}];
 expect(invoices.filter(isOutstandingInvoice).reduce((sum,i)=>sum+i.total,0)).toBe(100);
});
