import { expect, it, vi } from 'vitest';
const m=vi.hoisted(()=>({business:vi.fn(),user:vi.fn()}));
vi.mock('@/lib/db',()=>({default:{business:{findUnique:m.business},user:{findUnique:m.user}}}));
import { getBusinessCurrency } from '@/lib/business-currency';
it('uses the shared business currency for contact valuations',async()=>{
 m.business.mockResolvedValue({currency:'USD'});
 expect(await getBusinessCurrency({user:{id:'u',businessId:'b'}})).toBe('USD');
 expect(m.business).toHaveBeenCalledWith({where:{id:'b'},select:{currency:true}});
});
it('uses personal currency for a legacy solo account',async()=>{
 m.user.mockResolvedValue({currency:'EUR'});
 expect(await getBusinessCurrency({user:{id:'u',businessId:null}})).toBe('EUR');
});
