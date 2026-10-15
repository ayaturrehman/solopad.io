import { expect, it, vi } from 'vitest';
import { validateBankDetails, bankPaymentReference } from '@/lib/bank-transfer';
import { applyReceipt, remainingInvoiceAmount, remainingMilestoneAmount, settleStripeReceipt } from '@/lib/invoice-receipts';
it('validates UK details and international IBAN checksums',()=>{
  expect(validateBankDetails({accountName:'Example',sortCode:'12-34-56',accountNumber:'12345678'}).sortCode).toBe('123456');
  expect(validateBankDetails({accountName:'Example',iban:'GB82 WEST 1234 5698 7654 32'}).iban).toBe('GB82WEST12345698765432');
  for(const details of [{accountName:'Example'}, {accountName:'Example',sortCode:'123',accountNumber:'12345678'}, {accountName:'Example',iban:'GB00WEST12345698765432'}]) expect(()=>validateBankDetails(details)).toThrow();
  expect(bankPaymentReference({id:'x',paymentReference:'SP-123456789012345'})).toBe('SP-123456789012345');
});
it('deducts partial receipts and rejects overpayment without marking paid',async()=>{
  const invoice={id:'i',total:100,amountPaid:25,paymentPlans:[]};
  expect(remainingInvoiceAmount(invoice)).toBe(75);
  const tx={invoice:{update:vi.fn()},paymentPlan:{update:vi.fn()}};
  await applyReceipt(tx,invoice,{amount:25,receivedAt:new Date()});
  expect(tx.invoice.update.mock.calls[0][0].data).toEqual({amountPaid:50});
  await expect(applyReceipt(tx,invoice,{amount:76})).rejects.toThrow('exceeds');
});
it('supports partial milestone receipts and closes the invoice on the last receipt',async()=>{
  const invoice={id:'i',total:50,amountPaid:40,paymentPlans:[{id:'m',amount:25,amountPaid:15,status:'upcoming'}]};
  expect(remainingMilestoneAmount(invoice.paymentPlans[0])).toBe(10);
  const tx={invoice:{update:vi.fn()},paymentPlan:{update:vi.fn()}};
  await applyReceipt(tx,invoice,{amount:10,milestoneId:'m',receivedAt:new Date()});
  expect(tx.invoice.update.mock.calls[0][0].data.status).toBe('paid');
  expect(tx.paymentPlan.update.mock.calls[0][0].data.amountPaid).toBe(25);
});
it('credits a Stripe receipt once across return-page and webhook retries',async()=>{
  let receipt={id:'r',status:'pending',amount:60};
  const invoice={id:'i',total:100,currency:'GBP',status:'sent',amountPaid:40,paymentPlans:[],project:{}};
  const tx={$queryRaw:vi.fn(),invoice:{findUnique:async()=>invoice,update:vi.fn(async({data})=>Object.assign(invoice,data))},invoicePayment:{findUnique:async()=>receipt,update:vi.fn(async()=>{receipt.status='paid';})}};
  const db={$transaction:fn=>fn(tx)};
  const session={id:'cs_test',payment_status:'paid',amount_total:6000,currency:'gbp',metadata:{invoiceId:'i'}};
  await settleStripeReceipt(db,session); await settleStripeReceipt(db,session);
  expect(invoice.amountPaid).toBe(100); expect(tx.invoice.update).toHaveBeenCalledTimes(1);
});
it('rejects a paid session with the wrong currency or amount',async()=>{
  const tx={$queryRaw:vi.fn(),invoice:{findUnique:async()=>({id:'i',total:100,currency:'GBP',status:'sent',amountPaid:40,paymentPlans:[],project:{}})},invoicePayment:{findUnique:async()=>({id:'r',status:'pending',amount:60})}};
  await expect(settleStripeReceipt({$transaction:fn=>fn(tx)},{id:'cs_test',payment_status:'paid',amount_total:1,currency:'usd',metadata:{invoiceId:'i'}})).rejects.toThrow('does not match');
});
