import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { authLimiter } from '@/lib/rate-limit';
import { validatePassword } from '@/lib/passwordValidation';
import { readPasswordReset, verifyPasswordReset } from '@/lib/password-reset';

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!authLimiter.check(`reset:${ip}`).success) return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  try {
    const { token, password } = await req.json();
    const error = typeof password === 'string' ? validatePassword(password) : 'Enter a new password.';
    if (error) return NextResponse.json({ error }, { status: 400 });
    const parsed = readPasswordReset(token);
    const invalid = () => NextResponse.json({ error: 'This reset link is invalid or expired. Request a new one.' }, { status: 400 });
    if (!parsed) return invalid();
    const user = await db.user.findUnique({ where: { id: parsed.id }, select: { id: true, password: true } });
    if (!user || !verifyPasswordReset(token, user)) return invalid();
    // Atomic compare-and-update makes tokens single-use even for concurrent requests.
    const changed = await db.user.updateMany({ where: { id: user.id, password: user.password }, data: { password: await bcrypt.hash(password, 10) } });
    if (changed.count !== 1) return invalid();
    return NextResponse.json({ message: 'Password updated. Sign in with your new password.' });
  } catch {
    return NextResponse.json({ error: 'Could not reset your password. Please try again.' }, { status: 500 });
  }
}
