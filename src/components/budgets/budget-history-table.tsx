'use client';

import type { BudgetItem } from '@/actions/budget';
import { formatRupiah, formatDate } from '@/lib/format';

interface BudgetHistoryTableProps {
  budgets: BudgetItem[];
  onSelectPeriod: (month: number, year: number) => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function BudgetHistoryTable({ budgets, onSelectPeriod }: BudgetHistoryTableProps) {
  if (budgets.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-3">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-8 5H5a2 2 0 0 1-2-2V7" />
            <path d="M16 11h.01" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Belum Ada Anggaran Bulanan
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Tetapkan pagu target anggaran Anda pada formulir di atas untuk mengontrol pengeluaran tiap bulan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Riwayat Anggaran Bulanan
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Daftar target anggaran bulanan yang telah Anda tetapkan.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3.5">Periode</th>
              <th className="px-5 py-3.5">Target Nominal</th>
              <th className="px-5 py-3.5">Pembaruan Terakhir</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {budgets.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                  {MONTH_NAMES[b.month - 1]} {b.year}
                </td>
                <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                  {formatRupiah(b.targetAmount)}
                </td>
                <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                  {b.updatedAt ? formatDate(b.updatedAt) : '-'}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectPeriod(b.month, b.year)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Pilih & Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
