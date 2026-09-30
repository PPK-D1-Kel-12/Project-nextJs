'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { BudgetAnalyticsSummary } from '@/actions/budget-analytics';
import { setMonthlyBudgetGoal } from '@/actions/budget-analytics';
import { formatRupiah } from '@/lib/format';

interface BudgetSummaryWidgetProps {
  summary: BudgetAnalyticsSummary;
}

export function BudgetSummaryWidget({ summary }: BudgetSummaryWidgetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>(
    summary.targetBudget > 0 ? String(summary.targetBudget) : '3000000'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    monthName,
    year,
    targetBudget,
    actualExpense,
    remainingBudget,
    percentageUsed,
    status,
    hasBudget,
  } = summary;

  // Penentuan styling berbasis threshold indikator (SRS-14)
  const isOverBudget = status === 'OVER_BUDGET';
  const isWarning = status === 'WARNING';
  const isSafe = status === 'SAFE';

  let statusBadge = {
    label: 'Aman',
    bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    barColor: 'bg-emerald-500',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  };

  if (isOverBudget) {
    statusBadge = {
      label: 'Melebihi Anggaran (Over-Budget)',
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse',
      barColor: 'bg-rose-500',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    };
  } else if (isWarning) {
    statusBadge = {
      label: 'Mendekati Batas (Waspada)',
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      barColor: 'bg-amber-500',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    };
  } else if (!hasBudget) {
    statusBadge = {
      label: 'Belum Ada Anggaran',
      bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700',
      barColor: 'bg-slate-400',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    };
  }

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const amount = Number(customAmount);

    if (isNaN(amount) || amount < 0) {
      setErrorMessage('Masukkan nominal anggaran positif yang valid.');
      return;
    }

    startTransition(async () => {
      const res = await setMonthlyBudgetGoal(amount, summary.month, summary.year);
      if (res.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        setErrorMessage(res.error || 'Gagal menyimpan target anggaran.');
      }
    });
  };

  // Lebar bar dibatasi max 100% pada visual container
  const progressWidth = Math.min(100, percentageUsed);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-6 transition-all">
      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Monitoring Anggaran Bulanan
              </h2>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {monthName} {year}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau realisasi pengeluaran terhadap target pagu anggaran (SRS-13 & SRS-14)
            </p>
          </div>
        </div>

        {/* Status Badge & Edit Target Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.bg}`}
          >
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </span>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-lg transition-colors cursor-pointer"
          >
            {isEditing ? 'Batal' : 'Ubah Target'}
          </button>
        </div>
      </div>

      {/* Form Edit Target Anggaran (Inline Drawer) */}
      {isEditing && (
        <form
          onSubmit={handleSaveBudget}
          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label htmlFor="budget-amount-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              Target Anggaran Bulan {monthName}:
            </label>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                id="budget-amount-input"
                type="number"
                min="0"
                step="10000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Contoh: 3000000"
                className="w-full pl-9 pr-3 py-1.5 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
            >
              {isPending ? 'Menyimpan...' : 'Simpan Anggaran'}
            </button>
          </div>
          {errorMessage && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              {errorMessage}
            </p>
          )}
        </form>
      )}

      {/* Progress Bar & Indikator Visual (SRS-14) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Progres Pemakaian Anggaran
          </span>
          <span
            className={`font-bold font-mono ${
              isOverBudget
                ? 'text-rose-600 dark:text-rose-400'
                : isWarning
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {percentageUsed}% {isOverBudget && '(Terlampaui)'}
          </span>
        </div>

        {/* Bar Container */}
        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${statusBadge.barColor}`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* Penjelasan Status Indikator */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
          <span>0%</span>
          <span>Batas Waspada: 80%</span>
          <span>100% Pagu</span>
        </div>
      </div>

      {/* 3 Kartu Metrik Ringkasan Budget (SRS-13) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Metric 1: Target Anggaran */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pagu Anggaran
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatRupiah(targetBudget)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Batas belanja maksimal bulan ini
          </p>
        </div>

        {/* Metric 2: Realisasi Belanja */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Realisasi Pengeluaran
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {formatRupiah(actualExpense, { type: 'EXPENSE' })}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Total akumulasi transaksi keluar
          </p>
        </div>

        {/* Metric 3: Sisa Anggaran */}
        <div
          className={`p-4 rounded-xl border ${
            remainingBudget < 0
              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800'
          }`}
        >
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              remainingBudget < 0
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {remainingBudget < 0 ? 'Defisit Anggaran' : 'Sisa Anggaran'}
          </span>
          <div
            className={`text-lg sm:text-xl font-bold font-mono mt-1 ${
              remainingBudget < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatRupiah(remainingBudget)}
          </div>
          <p className="text-[11px] mt-0.5">
            {remainingBudget < 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                Melebihi alokasi sebesar {formatRupiah(Math.abs(remainingBudget))}
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                Alokasi yang masih dapat digunakan
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
