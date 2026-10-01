import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Daftar Akun - Expense Tracker',
  description: 'Daftar akun baru di aplikasi Expense Tracker',
};

export default function RegisterPage() {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans bg-[#f7f4ea] dark:bg-[#0c1524] transition-colors"
    >
      {/* Decorative ambient clay glows: warm amber/emerald in cream mode, oceanic blue in dark mode */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-amber-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-emerald-500/10 dark:bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      <RegisterForm />
    </div>
  );
}
