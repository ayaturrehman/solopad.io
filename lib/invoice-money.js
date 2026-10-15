import { isOutstandingInvoice, outstandingInvoiceAmount } from './invoice-status';

function grouped(records) {
  const amounts = new Map();
  for (const { currency, total } of records) {
    const code = currency.toUpperCase();
    amounts.set(code, (amounts.get(code) || 0) + Number(total || 0));
  }
  return [...amounts].map(([currency, total]) => ({ currency, total }));
}
export function summarizeInvoiceMoney(invoices, expenses, businessCurrency = 'USD') {
  const payments = invoices.flatMap(invoice => {
    const currency = invoice.currency || businessCurrency;
    if (invoice.status === 'paid') return [{ currency, total: invoice.total }];
    if (!isOutstandingInvoice(invoice)) return [];
    return (invoice.paymentPlans || []).filter(item => item.status === 'paid').map(item => ({ currency, total: item.amount }));
  });
  const costs = expenses.map(expense => ({ currency: businessCurrency, total: expense.amount }));
  return {
    revenue: grouped(payments),
    expenses: grouped(costs),
    netIncome: grouped([...payments, ...costs.map(item => ({ ...item, total: -item.total }))]),
    outstanding: grouped(invoices.filter(isOutstandingInvoice).map(invoice => ({ currency: invoice.currency || businessCurrency, total: outstandingInvoiceAmount(invoice) }))),
  };
}
