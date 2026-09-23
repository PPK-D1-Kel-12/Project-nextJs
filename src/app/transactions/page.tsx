'use client';

import { useState, useEffect } from 'react';
import {
  getTransactions,
  deleteTransaction,
  type TransactionItem,
  type TransactionFilter,
} from '@/actions/transactions';
import { TransactionModal } from '@/components/transaction-modal';
import { formatRupiah, formatDate } from '@/lib/format';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter states (SRS-08)
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modal & Edit state (SRS-07, SRS-09)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionItem | null>(null);

  // Delete Confirmation state (SRS-10)
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Initial load via effect without synchronous setState
  useEffect(() => {
    let ignore = false;

    async function fetchInitial() {
      try {
        const data = await getTransactions({
          type: 'ALL',
        });
        if (!ignore) {
          setTransactions(data);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setFetchError(err instanceof Error ? err.message : 'Gagal memuat daftar transaksi.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchInitial();

    return () => {
      ignore = true;
    };
  }, []);

  // Handler for user-initiated refreshes (events)
  const executeFilterQuery = async (customFilter?: TransactionFilter) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const activeFilter: TransactionFilter = customFilter ?? {
        type: typeFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const data = await getTransactions(activeFilter);
      setTransactions(data);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Gagal memuat daftar transaksi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    executeFilterQuery({
      type: typeFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleResetFilter = () => {
    setTypeFilter('ALL');
    setStartDate('');
    setEndDate('');
    executeFilterQuery({
      type: 'ALL',
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleOpenAdd = () => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: TransactionItem) => {
    setTransactionToEdit(tx);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    executeFilterQuery();
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteTransaction(transactionToDelete.id);
      if (!res.success) {
        setDeleteError(res.error || 'Gagal menghapus transaksi.');
        setIsDeleting(false);
        return;
      }

      // Berhasil dihapus
      setTransactionToDelete(null);
      executeFilterQuery();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menghapus.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Halaman (SRS-08) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Riwayat Transaksi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola, saring, ubah, dan pantau seluruh catatan arus kas keuangan Anda.
          </p>
        </div>

        {/* Tombol Tambah Transaksi */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-sm font-semibold transition-all cursor-pointer shadow-xs hover:shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Tambah Transaksi</span>
        </button>
      </div>

      {/* Filter Panel (SRS-08) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <form onSubmit={handleApplyFilter} className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Filter Pencarian Transaksi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Filter Jenis: Segmented Pills */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Jenis Transaksi
              </label>
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
                {(
                  [
                    { key: 'ALL', label: 'Semua' },
                    { key: 'INCOME', label: 'Pemasukan' },
                    { key: 'EXPENSE', label: 'Pengeluaran' },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setTypeFilter(option.key)}
                    className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      typeFilter === option.key
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Dari Tanggal */}
            <div>
              <label htmlFor="startDate" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Dari Tanggal
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:outline-hidden transition-all"
              />
            </div>

            {/* Filter Sampai Tanggal */}
            <div>
              <label htmlFor="endDate" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Sampai Tanggal
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Action Buttons: Terapkan & Reset */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleResetFilter}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Reset Filter</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Terapkan Filter</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Transaksi (SRS-08, SRS-09, SRS-10) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {fetchError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
            <span>{fetchError}</span>
            <button
              type="button"
              onClick={() => executeFilterQuery()}
              className="font-bold underline cursor-pointer"
            >
              Coba lagi
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-8 h-8 animate-spin text-slate-600 dark:text-slate-400 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-xs font-medium">Memuat data transaksi...</span>
          </div>
        ) : transactions.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m10 15 4-4-4-4" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tidak ada transaksi ditemukan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Tidak ada data yang cocok dengan kriteria filter yang dipilih atau belum ada transaksi tercatat.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilter}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Reset Filter
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer"
              >
                Tambah Transaksi Baru
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-6">Tanggal</th>
                  <th className="py-3.5 px-6">Keterangan</th>
                  <th className="py-3.5 px-6">Jenis</th>
                  <th className="py-3.5 px-6 text-right">Nominal</th>
                  <th className="py-3.5 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Tanggal */}
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {formatDate(tx.date)}
                      </td>

                      {/* Keterangan */}
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                        {tx.description}
                      </td>

                      {/* Jenis Badge */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isIncome ? (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m7 7 10 10" />
                              <path d="M17 7v10H7" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M7 17 17 7" />
                              <path d="M7 7h10v10" />
                            </svg>
                          )}
                          <span>{isIncome ? 'Pemasukan' : 'Pengeluaran'}</span>
                        </span>
                      </td>

                      {/* Nominal */}
                      <td className="py-4 px-6 whitespace-nowrap text-right font-mono font-bold">
                        <span
                          className={
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {formatRupiah(tx.amount, { type: tx.type })}
                        </span>
                      </td>

                      {/* Aksi (SRS-09, SRS-10) */}
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Tombol Ubah (SRS-09) */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(tx)}
                            title="Ubah Transaksi"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                            <span>Ubah</span>
                          </button>

                          {/* Tombol Hapus (SRS-10) */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setTransactionToDelete(tx);
                            }}
                            title="Hapus Transaksi"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog Tambah / Ubah Transaksi (SRS-07, SRS-09) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTransactionToEdit(null);
        }}
        onSuccess={handleModalSuccess}
        transactionToEdit={transactionToEdit}
      />

      {/* Confirmation Dialog Hapus Transaksi (SRS-10) */}
      {transactionToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-all"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setTransactionToDelete(null);
          }}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Konfirmasi Hapus Transaksi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  SRS-10: Penghapusan transaksi permanen
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {deleteError}
              </div>
            )}

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Apakah Anda yakin ingin menghapus transaksi{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                &ldquo;{transactionToDelete.description}&rdquo;
              </span>{' '}
              senilai{' '}
              <span className="font-semibold font-mono text-slate-900 dark:text-white">
                {formatRupiah(transactionToDelete.amount)}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setTransactionToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
