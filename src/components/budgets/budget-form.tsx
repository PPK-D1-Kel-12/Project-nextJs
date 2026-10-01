'use client';

import { useState, useTransition } from 'react';
import { setMonthlyBudget, deleteBudget, type BudgetItem } from '@/actions/budget';
import { formatRupiah } from '@/lib/format';

interface BudgetFormProps {
  selectedMonth: number;
  selectedYear: number;
  currentBudget: BudgetItem | null;
  onPeriodChange: (month: number, year: number) => void;
  onBudgetUpdated: () => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const PRESETS = [1000000, 2500000, 5000000, 10000000, 15000000];

export function BudgetForm({
  selectedMonth,
  selectedYear,
  currentBudget,
  onPeriodChange,
  onBudgetUpdated,
}: BudgetFormProps) {
  const [amountStr, setAmountStr] = useState<string>(
    currentBudget ? String(currentBudget.targetAmount) : ''
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = Number(e.target.value);
    onPeriodChange(newMonth, selectedYear);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = Number(e.target.value);
    onPeriodChange(selectedMonth, newYear);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numericAmount = parseFloat(amountStr.replace(/[^0-9]/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Target anggaran harus berupa nominal angka positif.');
      return;
    }

    startTransition(async () => {
      const result = await setMonthlyBudget({
        month: selectedMonth,
        year: selectedYear,
        targetAmount: numericAmount,
      });

      if (!result.success) {
        setErrorMsg(result.error || 'Gagal menyimpan anggaran');
      } else {
        setSuccessMsg(
          `Target anggaran untuk ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} berhasil ${
            currentBudget ? 'diperbarui' : 'ditetapkan'
          }!`
        );
        onBudgetUpdated();
      }
    });
  };

  const handleDelete = () => {
    if (!currentBudget) return;
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus anggaran untuk ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}?`
    );
    if (!confirmDelete) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const result = await deleteBudget(currentBudget.id);
      if (!result.success) {
        setErrorMsg(result.error || 'Gagal menghapus anggaran');
      } else {
        setAmountStr('');
        setSuccessMsg(`Anggaran ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} berhasil dihapus.`);
        onBudgetUpdated();
      }
    });
  };

  const currentNumeric = parseFloat(amountStr.replace(/[^0-9]/g, '')) || 0;

  return (
    <div className="clay-card p-6 sm:p-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/80 pb-5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Tetapkan Target Anggaran
          </h2>
        </div>

        {/* Period Pickers */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            disabled={isPending}
            className="clay-input px-3.5 py-2 text-xs sm:text-sm font-bold cursor-pointer"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={handleYearChange}
            disabled={isPending}
            className="clay-input px-3.5 py-2 text-xs sm:text-sm font-bold cursor-pointer"
          >
            {[2025, 2026, 2027, 2028].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-xs underline ml-2 cursor-pointer font-bold">
            Tutup
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-xs underline ml-2 cursor-pointer font-bold">
            Tutup
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Target Nominal Anggaran
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="Contoh: 5000000"
              disabled={isPending}
              className="clay-input w-full pl-12 pr-4 py-2.5 text-base font-bold font-mono placeholder:text-slate-400"
            />
          </div>
          {currentNumeric > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Terbaca: <span className="font-extrabold font-mono text-sky-600 dark:text-sky-400">{formatRupiah(currentNumeric)}</span>
            </p>
          )}
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Pilihan Nominal Cepat
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmountStr(String(p))}
                disabled={isPending}
                className="clay-btn-secondary px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
              >
                {formatRupiah(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-2">
          {currentBudget ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="clay-btn-rose px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Hapus Anggaran
            </button>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={isPending}
            className="clay-btn-primary px-6 py-2.5 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Menyimpan...' : currentBudget ? 'Perbarui Anggaran' : 'Simpan Anggaran'}
          </button>
        </div>
      </form>
    </div>
  );
}
