import { beforeEach, expect, it, vi } from 'vitest';
const m=vi.hoisted(()=>({event:null,find:vi.fn(),update:vi.fn(),updateMany:vi.fn(),notification:vi.fn(),processed:vi.fn(),mark:vi.fn()}));
vi.mock('@/lib/stripe',()=>({requireStripe:()=>({webhooks:{constructEvent:()=>m.event}})}));
vi.mock('@/lib/db',()=>({default:{invoice:{findUnique:m.find,update:m.update,updateMany:m.updateMany},notification:{create:m.notification}}}));
vi.mock('@/lib/email',()=>({sendNotificationEmail:vi.fn()}));
vi.mock('@/lib/webhook-events',()=>({isEventProcessed:m.processed,markEventProcessed:m.mark}));
import {POST} from '@/app/api/webhooks/stripe/route';
const req=()=>new Request('http://localhost/api/webhooks/stripe',{method:'POST',body:'{}'});
beforeEach(()=>{vi.resetAllMocks();m.event={id:'evt_qa',type:'checkout.session.completed',data:{object:{payment_status:'paid',metadata:{invoiceId:'qa-invoice'},payment_intent:'pi_qa'}}};m.find.mockResolvedValue({status:'sent'});m.update.mockResolvedValue({total:12,currency:'GBP'});});
it('returns 500 when invoice processing fails, leaving the event retryable',async()=>{m.update.mockRejectedValue(new Error('Database unavailable'));expect((await POST(req())).status).toBe(500);expect(m.mark).not.toHaveBeenCalled();});
it('acknowledges successful processing and skips duplicate deliveries',async()=>{expect((await POST(req())).status).toBe(200);expect(m.mark).toHaveBeenCalledWith('evt_qa',expect.any(Object));m.processed.mockResolvedValue(true);expect(await (await POST(req())).json()).toEqual({received:true,duplicate:true});expect(m.update).toHaveBeenCalledTimes(1);});

it('keeps unpaid completed checkouts pending until settlement',async()=>{m.event.data.object.payment_status='unpaid';expect((await POST(req())).status).toBe(200);expect(m.update).not.toHaveBeenCalled();});
it('marks a delayed payment paid only after async success',async()=>{m.event.type='checkout.session.async_payment_succeeded';expect((await POST(req())).status).toBe(200);expect(m.update).toHaveBeenCalledWith(expect.objectContaining({data:expect.objectContaining({status:'paid'})}));});
it('does not mark an async failed payment paid',async()=>{m.event.type='checkout.session.async_payment_failed';m.event.data.object.payment_status='unpaid';expect((await POST(req())).status).toBe(200);expect(m.update).not.toHaveBeenCalled();});

it('does not clear a replacement checkout when an older session expires',async()=>{m.event.type='checkout.session.expired';m.event.data.object.id='cs_old';expect((await POST(req())).status).toBe(200);expect(m.updateMany).toHaveBeenCalledWith({where:{id:'qa-invoice',stripeSessionId:'cs_old',status:{not:'paid'}},data:{stripeSessionId:null}});});
