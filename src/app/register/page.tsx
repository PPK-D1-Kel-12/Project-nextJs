import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Daftar Akun - Expense Tracker',
  description: 'Daftar akun baru di aplikasi Expense Tracker',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-black font-sans">
      <RegisterForm />
    </div>
  );
}
