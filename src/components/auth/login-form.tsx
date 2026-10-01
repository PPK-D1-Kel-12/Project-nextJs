'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction, demoLoginAction, type AuthActionState } from '@/actions/auth';

const initialState: AuthActionState = {
  error: null,
  success: null,
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

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
          Selamat Datang Kembali
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-[#91a5c2]">
          Masuk ke akun Anda untuk melihat ringkasan keuangan dan transaksi
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

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="redirectTo" value={redirectTo} />

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
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isPending}
            className="clay-input w-full px-4 py-3 placeholder:text-stone-400 dark:placeholder:text-[#6782a8] disabled:opacity-50 text-sm font-medium"
          />
        </div>

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
              <span>Memproses...</span>
            </>
          ) : (
            'Masuk'
          )}
        </button>

        <div className="relative flex items-center justify-center my-5">
          <div className="h-px bg-stone-200 dark:bg-[#1e304f] w-full" />
          <span className="absolute bg-white dark:bg-[#152238] px-3 text-xs font-bold text-stone-400 dark:text-[#91a5c2] uppercase tracking-widest">
            atau
          </span>
        </div>

        <button
          type="button"
          onClick={() => demoLoginAction(redirectTo)}
          className="clay-btn-secondary w-full py-3 px-4 rounded-2xl font-semibold flex items-center justify-center gap-2.5 text-sm cursor-pointer border border-stone-200/50 dark:border-[#1e304f]/80"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/15 dark:bg-emerald-400/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <span>Masuk Cepat Mode Demo (Pengujian)</span>
        </button>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-stone-600 dark:text-[#91a5c2]">
        Belum memiliki akun?{' '}
        <Link
          href="/register"
          className="font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline underline-offset-4 transition-colors"
        >
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}
