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

  // Pagination state (SRS-08)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modal & Edit state (SRS-07, SRS-09)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionItem | null>(null);

  // Delete Confirmation state (SRS-10)
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Sliced data pagination (SRS-08)
  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, transactions.length);
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

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
    setCurrentPage(1);
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
    setCurrentPage(1);
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
        </div>

        {/* Tombol Tambah Transaksi */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="clay-btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Tambah Transaksi</span>
        </button>
      </div>

      {/* Filter Panel (SRS-08) */}
      <div className="clay-card p-6 space-y-4">
        <form onSubmit={handleApplyFilter} className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
            <div className="clay-water-pod w-8 h-8 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-300">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Filter Pencarian Transaksi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
            {/* Filter Jenis: Segmented Clay Pod */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Jenis Transaksi
              </label>
              <div className="clay-pod flex p-1 rounded-2xl gap-1">
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
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      typeFilter === option.key
                        ? 'clay-btn-primary'
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
              <label htmlFor="startDate" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Dari Tanggal
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="clay-input w-full px-3.5 py-2 text-xs font-semibold"
              />
            </div>

            {/* Filter Sampai Tanggal */}
            <div>
              <label htmlFor="endDate" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Sampai Tanggal
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="clay-input w-full px-3.5 py-2 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Action Buttons: Terapkan & Reset */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetFilter}
              className="clay-btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Reset Filter</span>
            </button>
            <button
              type="submit"
              className="clay-btn-primary inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Terapkan Filter</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Transaksi (SRS-08, SRS-09, SRS-10) */}
      <div className="clay-card overflow-hidden">
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
            <div className="clay-water-pod w-14 h-14 mx-auto rounded-2xl text-sky-600 dark:text-sky-300 flex items-center justify-center mb-3">
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
                className="clay-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Reset Filter
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="clay-btn-primary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Tambah Transaksi Baru
              </button>
            </div>
          </div>
        ) : (
          <>
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
                  {paginatedTransactions.map((tx) => {
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold clay-badge uppercase tracking-wider ${
                              isIncome
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {isIncome ? (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m7 7 10 10" />
                                <path d="M17 7v10H7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7 17 17 7" />
                                <path d="M7 7h10v10" />
                              </svg>
                            )}
                            <span>{isIncome ? 'Pemasukan' : 'Pengeluaran'}</span>
                          </span>
                        </td>

                        {/* Nominal */}
                        <td className="py-4 px-6 whitespace-nowrap text-right font-mono font-extrabold text-sm sm:text-base">
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
                          <div className="inline-flex items-center gap-2">
                            {/* Tombol Ubah (SRS-09) */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(tx)}
                              title="Ubah Transaksi"
                              className="clay-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                              className="clay-btn-rose inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

            {/* Pagination Controls (SRS-08) */}
            {transactions.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="text-slate-500 dark:text-slate-400 font-medium">
                  Menampilkan <span className="font-bold text-slate-900 dark:text-white">{startIndex + 1}</span> sampai{' '}
                  <span className="font-bold text-slate-900 dark:text-white">{endIndex}</span> dari{' '}
                  <span className="font-bold text-slate-900 dark:text-white">{transactions.length}</span> transaksi
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="clay-btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    <span>Sebelumnya</span>
                  </button>
                  <span className="px-2 text-slate-700 dark:text-slate-300 font-bold">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="clay-btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Selanjutnya</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
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
            className="clay-card w-full max-w-md p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3.5">
              <div className="clay-water-pod w-12 h-12 rounded-2xl text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Konfirmasi Hapus Transaksi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  SRS-10: Penghapusan transaksi permanen
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold">
                {deleteError}
              </div>
            )}

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Apakah Anda yakin ingin menghapus transaksi{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                &ldquo;{transactionToDelete.description}&rdquo;
              </span>{' '}
              senilai{' '}
              <span className="font-extrabold font-mono text-slate-900 dark:text-white">
                {formatRupiah(transactionToDelete.amount)}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setTransactionToDelete(null)}
                disabled={isDeleting}
                className="clay-btn-secondary px-4 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="clay-btn-rose inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white cursor-pointer disabled:opacity-50"
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
