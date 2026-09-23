import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { getCurrentUser } from '@/lib/auth-user';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Expense Tracker',
    default: 'Expense Tracker - Kelola Keuangan Pribadi',
  },
  description: 'Aplikasi pencatatan pengeluaran dan pemasukan keuangan modern',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('app_theme')?.value;
  const isDark = theme === 'dark';
  const user = await getCurrentUser();

  return (
    <html
      lang="id"
      className={`${isDark ? 'dark' : ''} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 transition-colors">
        <Navbar initialTheme={isDark ? 'dark' : 'light'} userName={user.name} />
        <div className="flex-1 w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
