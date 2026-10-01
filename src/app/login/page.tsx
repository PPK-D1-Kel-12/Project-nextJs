import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Masuk - Expense Tracker',
  description: 'Masuk ke aplikasi Expense Tracker Anda',
};

export default function LoginPage() {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans bg-[#f7f4ea] dark:bg-[#0c1524] transition-colors"
    >
      {/* Decorative ambient clay glows: warm honey/amber in cream mode, oceanic blue in dark mode */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-400/10 dark:bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="p-8 text-center text-stone-500 dark:text-[#91a5c2]">Memuat form login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
