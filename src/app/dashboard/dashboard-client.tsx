'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { DashboardSummary } from '@/actions/transactions';
import type { BudgetAnalyticsSummary } from '@/actions/budget-analytics';
import { BudgetSummaryWidget } from '@/components/budget-summary-widget';
import { TransactionModal } from '@/components/transaction-modal';
import { formatRupiah, formatDate } from '@/lib/format';

interface DashboardClientProps {
  summary: DashboardSummary;
  budgetSummary?: BudgetAnalyticsSummary;
}

export function DashboardClient({ summary, budgetSummary }: DashboardClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDeficit = summary.balance < 0;

  const handleTransactionSuccess = () => {
    // Re-fetch data Server Component di background
    router.refresh();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Selamat Datang, {summary.userName}!
          </h1>
        </div>

        {/* Action Button: Tambah Transaksi */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="clay-btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Tambah Transaksi</span>
        </button>
      </div>

      {/* 3 Metric Cards (SRS-05) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Saldo Bersih */}
        <div
          className={`clay-card-interactive p-6 relative overflow-hidden transition-all ${
            isDeficit
              ? 'bg-rose-50/50 dark:bg-rose-950/20'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Saldo Bersih
            </span>
            <div
              className={`clay-water-pod w-10 h-10 rounded-2xl flex items-center justify-center ${
                isDeficit
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-sky-600 dark:text-sky-300'
              }`}
            >
              {isDeficit ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
                isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {formatRupiah(summary.balance)}
            </div>
            {isDeficit && (
              <p className="text-xs mt-1.5 font-medium">
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  Peringatan: Pengeluaran melebihi pemasukan (Defisit)
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Total Pemasukan */}
        <div className="clay-card-interactive p-6 relative overflow-hidden transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Pemasukan
            </span>
            <div className="clay-water-pod w-10 h-10 rounded-2xl text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7 7 10 10" />
                <path d="M17 7v10H7" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
              {formatRupiah(summary.totalIncome, { showSign: true })}
            </div>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="clay-card-interactive p-6 relative overflow-hidden transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Total Pengeluaran
            </span>
            <div className="clay-water-pod w-10 h-10 rounded-2xl text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 font-mono">
              {formatRupiah(summary.totalExpense, { type: 'EXPENSE' })}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Summary & Visual Indicator Widget (SRS-13 & SRS-14) */}
      {budgetSummary && <BudgetSummaryWidget summary={budgetSummary} />}

      {/* Recent Transactions Section (SRS-05) */}
      <div className="clay-card p-6 overflow-hidden">
        <div className="pb-5 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Transaksi Terbaru
            </h2>
          </div>
          <Link
            href="/transactions"
            className="clay-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold transition-all"
          >
            <span>Lihat Semua</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>

        {summary.recentTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="clay-water-pod w-14 h-14 mx-auto rounded-2xl text-sky-600 dark:text-sky-300 flex items-center justify-center mb-3">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Belum ada transaksi tercatat
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Mulai kelola keuangan Anda dengan mencatat transaksi pertama hari ini.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="clay-btn-primary mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tambah Transaksi Pertama
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
            {summary.recentTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <div
                  key={tx.id}
                  className="py-3.5 px-2 flex items-center justify-between rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Direction Icon */}
                    <div
                      className={`clay-water-pod w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m7 7 10 10" />
                          <path d="M17 7v10H7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17 17 7" />
                          <path d="M7 7h10v10" />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </p>
                        <span
                          className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full clay-badge text-[10px] font-bold uppercase tracking-wider ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    <span
                      className={`text-sm sm:text-base font-extrabold font-mono ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatRupiah(tx.amount, { type: tx.type })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Dialog Tambah Transaksi */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}
