import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Masuk - Expense Tracker',
  description: 'Masuk ke aplikasi Expense Tracker Anda',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-black font-sans">
      <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat form login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
