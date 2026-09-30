'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { BudgetItem } from '@/actions/budget';
import { compareMonthlyBudgetWithAllocations, type BudgetData } from '@/lib/budgets';
import { BudgetForm } from '@/components/budgets/budget-form';
import { BudgetHistoryTable } from '@/components/budgets/budget-history-table';
import { formatRupiah } from '@/lib/format';

interface BudgetClientProps {
  initialBudgets: BudgetItem[];
  currentMonth: number;
  currentYear: number;
  budgetData?: BudgetData | null;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function BudgetClient({
  initialBudgets,
  currentMonth,
  currentYear,
  budgetData,
}: BudgetClientProps) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  useEffect(() => {
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, [currentMonth, currentYear]);

  // Cari budget untuk periode aktif yang sedang dipilih di form
  const activeBudget = initialBudgets.find(
    (b) => b.month === selectedMonth && b.year === selectedYear
  ) || null;

  // Evaluasi perbandingan pagu target bulanan dengan alokasi rekening & kategori (SRS-11 & SRS-12)
  const comparison = compareMonthlyBudgetWithAllocations(
    activeBudget?.targetAmount || 0,
    budgetData || { accounts: [], categories: [], allocations: [] }
  );

  const handlePeriodChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;
    router.push(`/budgets?month=${formattedMonth}`);
  };

  const handlePrevMonth = () => {
    let prevMonth = selectedMonth - 1;
    let prevYear = selectedYear;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    handlePeriodChange(prevMonth, prevYear);
  };

  const handleNextMonth = () => {
    let nextMonth = selectedMonth + 1;
    let nextYear = selectedYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    handlePeriodChange(nextMonth, nextYear);
  };

  const handleBudgetUpdated = () => {
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Header & Global Period Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pengaturan Anggaran Bulanan
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola target pagu belanja pribadi dan alokasi pos pengeluaran Anda (SRS-11 s/d SRS-15).
          </p>
        </div>

        {/* Global Period Navigation Switcher */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Bulan sebelumnya"
            aria-label="Bulan sebelumnya"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="px-3 py-1 text-center min-w-[140px]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 block">
              Periode Aktif
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Bulan berikutnya"
            aria-label="Bulan berikutnya"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Overview Status Cards: Pagu Target Bulanan & Komparasi Alokasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Pagu Target Bulanan (SRS-11 & SRS-15) */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              Pagu Target Bulanan
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {activeBudget ? formatRupiah(activeBudget.targetAmount) : 'Rp 0'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeBudget
                ? 'Target tersimpan secara privat untuk akun Anda'
                : 'Pilih nominal di bawah untuk menetapkan target'}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                activeBudget
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60'
              }`}
            >
              {activeBudget ? 'Target Ditetapkan' : 'Belum Ada Target'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              SRS-11 & SRS-15
            </span>
          </div>
        </div>

        {/* Card 2: Komparasi Alokasi Kategori vs Target (SRS-12) */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              Alokasi Kategori vs Pagu
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                comparison.status === 'BALANCED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                  : comparison.status === 'OVER_ALLOCATED'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
                  : comparison.status === 'UNDER_ALLOCATED'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60'
              }`}
            >
              {comparison.status === 'BALANCED' && 'Teralokasi Penuh (100%)'}
              {comparison.status === 'OVER_ALLOCATED' && 'Melebihi Target'}
              {comparison.status === 'UNDER_ALLOCATED' && `Teralokasi ${comparison.allocationPercentage}%`}
              {comparison.status === 'NO_TARGET' && 'Target Belum Ada'}
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {formatRupiah(comparison.totalAllocated)}
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {comparison.targetBudget > 0
                  ? `${comparison.allocationPercentage}% dari target`
                  : 'Pagu target Rp 0'}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  comparison.status === 'OVER_ALLOCATED'
                    ? 'bg-rose-500'
                    : comparison.status === 'BALANCED'
                    ? 'bg-emerald-500'
                    : comparison.status === 'NO_TARGET'
                    ? 'bg-amber-500'
                    : 'bg-blue-600 dark:bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, comparison.allocationPercentage))}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              {comparison.status === 'OVER_ALLOCATED'
                ? `Kelebihan alokasi: ${formatRupiah(Math.abs(comparison.unallocatedAmount))}`
                : comparison.status === 'UNDER_ALLOCATED'
                ? `Sisa belum dialokasikan: ${formatRupiah(comparison.unallocatedAmount)}`
                : comparison.status === 'BALANCED'
                ? 'Semua pagu target telah dialokasikan'
                : 'Tetapkan target pagu untuk memantau alokasi'}
            </span>
            {comparison.targetBudget > 0 && (
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Target: {formatRupiah(comparison.targetBudget)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Core Budget Form (Anggota 1) */}
      <BudgetForm
        key={`${selectedMonth}-${selectedYear}-${activeBudget?.targetAmount ?? 'none'}`}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        currentBudget={activeBudget}
        onPeriodChange={handlePeriodChange}
        onBudgetUpdated={handleBudgetUpdated}
      />

      {/* History Table (Anggota 1) */}
      <BudgetHistoryTable
        budgets={initialBudgets}
        onSelectPeriod={handlePeriodChange}
      />
    </div>
  );
}
