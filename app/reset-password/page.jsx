import PasswordRecoveryForm from '@/components/shared/PasswordRecoveryForm';
export const metadata = { title: 'Reset password', referrer: 'no-referrer', robots: { index: false, follow: false } };
export default function Page() { return <PasswordRecoveryForm reset />; }
