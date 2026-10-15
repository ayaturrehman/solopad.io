import {beforeEach,expect,it,vi} from 'vitest';
const m=vi.hoisted(()=>({find:vi.fn(),create:vi.fn()}));
vi.mock('@/lib/db',()=>({default:{paymentPlan:{findUnique:m.find}}}));
vi.mock('@/lib/stripe',()=>({requireStripe:()=>({checkout:{sessions:{create:m.create}}}),calculatePlatformFee:amount=>Math.round(amount*.02)}));
import {POST} from '@/app/api/invoices/[id]/milestones/checkout/route';
let milestone;beforeEach(()=>{vi.resetAllMocks();milestone={id:'milestone',invoiceId:'invoice',status:'upcoming',amount:25,invoice:{status:'sent',currency:'GBP',project:{portalToken:'qa',user:{stripeAccountId:'acct_test',stripeOnboarded:true,plan:'solo'}}}};m.find.mockImplementation(async()=>milestone);m.create.mockResolvedValue({url:'https://checkout.stripe.com/test'});});
const call=()=>POST(new Request('http://localhost',{method:'POST',body:JSON.stringify({milestoneId:'milestone'})}),{params:Promise.resolve({id:'invoice'})});
it.each([['GBP',25,2500],['JPY',1500,1500],['KWD',1.23,1230]])('uses Stripe minor units for %s milestones',async(currency,total,amount)=>{milestone.amount=total;milestone.invoice.currency=currency;expect((await call()).status).toBe(200);expect(m.create.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(amount);});
it.each(['draft','cancelled','paid','refunded'])('blocks milestones for %s invoices',async status=>{milestone.invoice.status=status;expect((await call()).status).toBe(400);expect(m.create).not.toHaveBeenCalled();});
