import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import db from '@/lib/db';
import { registerLimiter } from '@/lib/rate-limit';
import { createPasswordReset } from '@/lib/password-reset';

const message = 'If an account exists for this email, a reset link will be sent. Check your inbox and spam folder.';
export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!registerLimiter.check(`reset:${ip}`).success) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  try {
    const { email } = await req.json();
    if (typeof email !== 'string' || email.length > 254 || !email.includes('@')) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Password recovery is temporarily unavailable. Please try again later.' }, { status: 503 });
    const user = await db.user.findUnique({ where: { email: email.trim() }, select: { id: true, email: true, password: true } });
    if (user) {
      const token = createPasswordReset(user);
      const origin = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
      if (!origin) throw new Error('App URL not configured');
      const link = new URL('/reset-password', origin); link.searchParams.set('token', token);
      const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'SoloPad <noreply@solopad.io>', to: user.email,
        subject: 'Reset your SoloPad password',
        text: `Use this link to reset your SoloPad password: ${link}\n\nThis link expires in 30 minutes and can only be used once. If you did not request it, ignore this email.`,
      });
      if (result.error) console.error('[Password recovery] Email could not be sent');
    }
    return NextResponse.json({ message });
  } catch {
    // Same response for existing and unknown accounts; never log reset tokens.
    return NextResponse.json({ message });
  }
}
