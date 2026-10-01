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
      <div className="clay-card p-8 text-center">
        <div className="clay-water-pod w-14 h-14 rounded-2xl text-sky-600 dark:text-sky-300 mx-auto flex items-center justify-center mb-3">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-8 5H5a2 2 0 0 1-2-2V7" />
            <path d="M16 11h.01" />
          </svg>
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Belum Ada Anggaran Bulanan
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto font-medium">
          Tentukan batas target anggaran Anda pada formulir di atas untuk mengontrol pengeluaran tiap bulan.
        </p>
      </div>
    );
  }

  return (
    <div className="clay-card overflow-hidden">
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/80">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
          Riwayat Anggaran Bulanan
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Daftar target anggaran bulanan yang telah Anda tetapkan.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/70 dark:bg-slate-900 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200/60 dark:border-slate-800/80">
            <tr>
              <th className="px-6 py-4">Periode</th>
              <th className="px-6 py-4">Target Nominal</th>
              <th className="px-6 py-4">Pembaruan Terakhir</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {budgets.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                  {MONTH_NAMES[b.month - 1]} {b.year}
                </td>
                <td className="px-6 py-4 font-mono font-extrabold text-sky-600 dark:text-sky-400">
                  {formatRupiah(b.targetAmount)}
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {b.updatedAt ? formatDate(b.updatedAt) : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectPeriod(b.month, b.year)}
                    className="clay-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
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
