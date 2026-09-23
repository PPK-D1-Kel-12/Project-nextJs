import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/auth/logout-button';

export const metadata = {
  title: 'Dashboard - Expense Tracker',
  description: 'Ringkasan keuangan dan catatan transaksi Anda',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const displayName =
    (user.user_metadata?.name as string) ||
    (user.email ? user.email.split('@')[0] : 'Pengguna');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Navigation Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ET
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Expense Tracker
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {user.email}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Halo, {displayName}! 👋
          </h1>
          <p className="mt-1 text-blue-100 text-sm sm:text-base">
            Sesi autentikasi Anda aktif. Akun berhasil terverifikasi.
          </p>
        </div>

        {/* Status Sesi & Kredensial (SRS-01..04 Verification Box) */}
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Informasi Sesi Login Aktif (SRS-03)
              </h2>
            </div>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Session Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm pt-1">
            <div>
              <p className="text-xs text-zinc-500">Nama Akun (SRS-01)</p>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {displayName}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Email Akun (SRS-02)</p>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Supabase User ID</p>
              <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 truncate">
                {user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder Area untuk Anggota 2 (SRS-05 s/d SRS-10) */}
        <div className="p-6 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">
              Area Modul Transaksi & Ringkasan Keuangan (Tugas Anggota 2)
            </h3>
            <span className="text-xs text-zinc-400">
              SRS-05, SRS-06, SRS-07, SRS-08, SRS-09, SRS-10
            </span>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Data pengguna <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-xs">userId: {user.id}</code> siap digunakan oleh Anggota 2 untuk menyimpan transaksi baru, menghitung total saldo pemasukan/pengeluaran, dan menyaring riwayat transaksi.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <p className="text-xs text-zinc-500">Total Pemasukan</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                Rp 0
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <p className="text-xs text-zinc-500">Total Pengeluaran</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                Rp 0
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <p className="text-xs text-zinc-500">Sisa Saldo</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                Rp 0
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
