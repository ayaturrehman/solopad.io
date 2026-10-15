import db from '@/lib/db';

export async function getBusinessCurrency(session) {
  if (session.user.businessId) {
    const business = await db.business.findUnique({ where: { id: session.user.businessId }, select: { currency: true } });
    return business?.currency || 'GBP';
  }
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { currency: true } });
  return user?.currency || 'GBP';
}
