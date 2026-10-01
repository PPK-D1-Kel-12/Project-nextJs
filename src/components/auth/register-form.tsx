'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction, type AuthActionState } from '@/actions/auth';

const initialState: AuthActionState = {
  error: null,
  success: null,
};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <div
      suppressHydrationWarning
      className="w-full max-w-md p-8 sm:p-10 clay-card"
    >
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="clay-water-pod w-14 h-14 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-300">
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-[#edf4fc]">
          Buat Akun Baru
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-[#91a5c2]">
          Mulai kelola pengeluaran dan pemasukan Anda dengan Expense Tracker
        </p>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="mb-6 p-4 text-sm font-medium text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/40 rounded-2xl border border-rose-200/60 dark:border-rose-800/40 flex items-start gap-3 shadow-inner"
        >
          <svg
            className="w-5 h-5 text-rose-500 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div
          role="status"
          className="mb-6 p-4 text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-3 shadow-inner"
        >
          <svg
            className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{state.success}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-[#c5d5ea]"
          >
            Nama Lengkap
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="misal: Budi Santoso"
            disabled={isPending}
            className="clay-input w-full px-4 py-3 placeholder:text-stone-400 dark:placeholder:text-[#6782a8] disabled:opacity-50 text-sm font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-[#c5d5ea]"
          >
            Alamat Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@email.com"
            disabled={isPending}
            className="clay-input w-full px-4 py-3 placeholder:text-stone-400 dark:placeholder:text-[#6782a8] disabled:opacity-50 text-sm font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-[#c5d5ea]"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Minimal 6 karakter"
            disabled={isPending}
            className="clay-input w-full px-4 py-3 placeholder:text-stone-400 dark:placeholder:text-[#6782a8] disabled:opacity-50 text-sm font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-[#c5d5ea]"
          >
            Konfirmasi Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Ulangi password"
            disabled={isPending}
            className="clay-input w-full px-4 py-3 placeholder:text-stone-400 dark:placeholder:text-[#6782a8] disabled:opacity-50 text-sm font-medium"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="clay-btn-primary w-full py-3.5 px-4 rounded-2xl text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Mendaftar...</span>
              </>
            ) : (
              'Daftar Sekarang'
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-stone-600 dark:text-[#91a5c2]">
        Sudah memiliki akun?{' '}
        <Link
          href="/login"
          className="font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline underline-offset-4 transition-colors"
        >
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
