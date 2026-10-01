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
    <div className="clay-card p-6 sm:p-7 space-y-6">
      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="clay-water-pod w-12 h-12 rounded-2xl text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Monitoring Anggaran Bulanan
              </h2>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/15 dark:bg-sky-400/20 px-2.5 py-0.5 rounded-full clay-badge">
                {monthName} {year}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge & Edit Target Button */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold clay-badge ${statusBadge.bg}`}
          >
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </span>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="clay-btn-secondary px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
          >
            {isEditing ? 'Batal' : 'Ubah Target'}
          </button>
        </div>
      </div>

      {/* Form Edit Target Anggaran (Inline Drawer) */}
      {isEditing && (
        <form
          onSubmit={handleSaveBudget}
          className="clay-pod p-5 rounded-2xl space-y-3 transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label htmlFor="budget-amount-input" className="text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
              Target Anggaran Bulan {monthName}:
            </label>
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
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
                className="clay-input w-full pl-10 pr-3.5 py-2 text-sm font-bold font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="clay-btn-primary px-5 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isPending ? 'Menyimpan...' : 'Simpan Anggaran'}
            </button>
          </div>
          {errorMessage && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">
              {errorMessage}
            </p>
          )}
        </form>
      )}

      {/* Progress Bar & Indikator Visual (SRS-14) */}
      <div className="clay-pod-white p-5 rounded-2xl space-y-3 transition-all">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Progres Pemakaian Anggaran
          </span>
          <span
            className={`font-extrabold font-mono text-sm ${
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

        {/* Bar Container - Sunken White 3D Clay Track */}
        <div className="clay-progress-track h-4 w-full p-0.5 overflow-hidden relative">
          <div
            className={`clay-progress-fill h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                : isWarning
                ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
            }`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {/* 3 Kartu Metrik Ringkasan Budget (SRS-13) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Metric 1: Batas Anggaran */}
        <div className="clay-pod-white p-5 rounded-2xl transition-all">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Batas Anggaran
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1.5">
            {formatRupiah(targetBudget)}
          </div>
        </div>

        {/* Metric 2: Realisasi Pengeluaran */}
        <div className="clay-pod-white p-5 rounded-2xl transition-all">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Realisasi Pengeluaran
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1.5">
            {formatRupiah(actualExpense, { type: 'EXPENSE' })}
          </div>
        </div>

        {/* Metric 3: Sisa Anggaran */}
        <div
          className={`clay-pod-white p-5 rounded-2xl transition-all ${
            remainingBudget < 0
              ? '!bg-rose-50/60 dark:!bg-rose-950/20 !border-rose-200 dark:!border-rose-900/60 text-rose-600 dark:text-rose-400'
              : ''
          }`}
        >
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${
              remainingBudget < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {remainingBudget < 0 ? 'Defisit Anggaran' : 'Sisa Anggaran'}
          </span>
          <div
            className={`text-xl sm:text-2xl font-extrabold font-mono mt-1.5 ${
              remainingBudget < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatRupiah(remainingBudget)}
          </div>
        </div>
      </div>
    </div>
  );
}
