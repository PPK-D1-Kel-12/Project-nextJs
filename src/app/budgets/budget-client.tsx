'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BudgetItem } from '@/actions/budget';
import { BudgetForm } from '@/components/budgets/budget-form';
import { BudgetHistoryTable } from '@/components/budgets/budget-history-table';
import { formatRupiah } from '@/lib/format';

interface BudgetClientProps {
  initialBudgets: BudgetItem[];
  currentMonth: number;
  currentYear: number;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function BudgetClient({
  initialBudgets,
  currentMonth,
  currentYear,
}: BudgetClientProps) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Cari budget untuk periode aktif yang sedang dipilih di form
  const activeBudget = initialBudgets.find(
    (b) => b.month === selectedMonth && b.year === selectedYear
  ) || null;

  const handlePeriodChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleBudgetUpdated = () => {
    router.refresh();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pengaturan Anggaran Bulanan
          </h1>
        </div>
      </div>

      {/* Overview Status Card untuk Bulan Terpilih */}
      <div className="clay-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Periode Aktif
            </span>
            <span className="clay-badge px-2.5 py-0.5 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/15 dark:bg-sky-400/20">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
            {activeBudget ? formatRupiah(activeBudget.targetAmount) : 'Rp 0'}
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span
            className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold clay-badge ${
              activeBudget
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
            }`}
          >
            {activeBudget ? 'Target Ditetapkan' : 'Belum Ada Target'}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            {activeBudget
              ? `Tersimpan secara privat untuk akun Anda`
              : `Pilih nominal di bawah untuk menetapkan`}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLOT ANGGOTA 3: Widget Ringkasan Anggaran (SRS-13 & SRS-14)                */}
      {/* (Anggota 3 dapat memasang <BudgetSummaryWidget /> di sini tanpa merge conflict) */}
      {/* ========================================================================= */}

      {/* Core Budget Form (Anggota 1) */}
      <BudgetForm
        key={`${selectedMonth}-${selectedYear}-${activeBudget?.targetAmount ?? 'none'}`}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        currentBudget={activeBudget}
        onPeriodChange={handlePeriodChange}
        onBudgetUpdated={handleBudgetUpdated}
      />

      {/* ========================================================================= */}
      {/* SLOT ANGGOTA 2: Alokasi Multi-Budget Kategori & Rekening (SRS-12)         */}
      {/* (Anggota 2 dapat memasang <BudgetAllocationList /> di sini tanpa merge conflict)*/}
      {/* ========================================================================= */}

      {/* History Table (Anggota 1) */}
      <BudgetHistoryTable
        budgets={initialBudgets}
        onSelectPeriod={handlePeriodChange}
      />
    </div>
  );
}
