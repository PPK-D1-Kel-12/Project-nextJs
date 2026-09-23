'use client';

import { useState, useEffect } from 'react';
import { createTransaction, updateTransaction, type TransactionItem } from '@/actions/transactions';
import { formatRupiah } from '@/lib/format';

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (transaction: TransactionItem) => void;
  transactionToEdit?: TransactionItem | null;
}

function TransactionModalContent({
  onClose,
  onSuccess,
  transactionToEdit,
}: Omit<TransactionModalProps, 'isOpen'>) {
  const isEditing = Boolean(transactionToEdit);

  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(transactionToEdit?.type || 'EXPENSE');
  const [amount, setAmount] = useState<string>(
    transactionToEdit ? transactionToEdit.amount.toString() : ''
  );
  const [date, setDate] = useState<string>(
    transactionToEdit?.date || new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>(transactionToEdit?.description || '');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setError('Nominal transaksi wajib diisi dan bernilai positif (> 0).');
      return;
    }

    if (!description.trim()) {
      setError('Keterangan transaksi wajib diisi.');
      return;
    }

    if (!date) {
      setError('Tanggal transaksi wajib dipilih.');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && transactionToEdit) {
        const res = await updateTransaction({
          id: transactionToEdit.id,
          type,
          amount: numericAmount,
          date,
          description: description.trim(),
        });

        if (!res.success) {
          setError(res.error || 'Gagal memperbarui transaksi.');
          setIsLoading(false);
          return;
        }

        if (res.data && onSuccess) {
          onSuccess(res.data);
        }
      } else {
        const res = await createTransaction({
          type,
          amount: numericAmount,
          date,
          description: description.trim(),
        });

        if (!res.success) {
          setError(res.error || 'Gagal membuat transaksi baru.');
          setIsLoading(false);
          return;
        }

        if (res.data && onSuccess) {
          onSuccess(res.data);
        }
      }

      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menyimpan transaksi.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const parsedAmount = Number(amount);
  const formattedPreview = !isNaN(parsedAmount) && parsedAmount > 0 ? formatRupiah(parsedAmount) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {isEditing ? 'Ubah Transaksi' : 'Tambah Transaksi Baru'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditing
                ? 'Perbarui rincian transaksi yang telah dicatat (SRS-09)'
                : 'Catat pemasukan atau pengeluaran keuangan Anda (SRS-07)'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Segmented Type Toggle (Pemasukan vs Pengeluaran) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  type === 'INCOME'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7 7 10 10" />
                  <path d="M17 7v10H7" />
                </svg>
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  type === 'EXPENSE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
                Pengeluaran
              </button>
            </div>
          </div>

          {/* Nominal Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nominal (Rp)
              </label>
              {formattedPreview && (
                <span className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                  {formattedPreview}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-semibold">
                Rp
              </div>
              <input
                id="amount"
                type="number"
                min="1"
                step="1"
                placeholder="Contoh: 500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Tanggal Input */}
          <div>
            <label htmlFor="date" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Tanggal Transaksi
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:outline-hidden transition-all"
            />
          </div>

          {/* Keterangan Input */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Keterangan
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Deskripsi transaksi, contoh: Pembelian bahan makanan mingguan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:outline-hidden transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Transaksi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TransactionModal(props: TransactionModalProps) {
  if (!props.isOpen) return null;

  return (
    <TransactionModalContent
      key={props.transactionToEdit?.id || 'new'}
      onClose={props.onClose}
      onSuccess={props.onSuccess}
      transactionToEdit={props.transactionToEdit}
    />
  );
}
