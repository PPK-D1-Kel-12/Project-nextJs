import { describe, it, expect } from 'vitest';
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactions,
  getDashboardSummary,
} from '@/actions/transactions';

describe('Transaction Actions & Security Rules (SRS-05, 07, 08, 09, 10)', () => {
  it('SRS-07: menolak transaksi jika nominal <= 0', async () => {
    const result = await createTransaction({
      type: 'EXPENSE',
      amount: 0,
      date: '2026-09-29',
      description: 'Test Invalid Amount',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Nominal transaksi wajib bernilai positif');
  });

  it('SRS-07: menolak transaksi jika keterangan kosong', async () => {
    const result = await createTransaction({
      type: 'INCOME',
      amount: 50000,
      date: '2026-09-29',
      description: '   ',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Keterangan transaksi wajib diisi');
  });

  it('SRS-07 & SRS-05: berhasil mencatat transaksi dan memperbarui ringkasan dashboard', async () => {
    const created = await createTransaction({
      type: 'INCOME',
      amount: 1000000,
      date: '2026-09-29',
      description: 'Bonus Proyek',
    });
    expect(created.success).toBe(true);
    expect(created.data?.id).toBeDefined();

    const summary = await getDashboardSummary();
    expect(summary.totalIncome).toBeGreaterThanOrEqual(1000000);
    expect(summary.balance).toBe(summary.totalIncome - summary.totalExpense);
  });

  it('SRS-08: menyaring riwayat transaksi berdasarkan jenis (INCOME / EXPENSE)', async () => {
    const incomeList = await getTransactions({ type: 'INCOME' });
    for (const item of incomeList) {
      expect(item.type).toBe('INCOME');
    }

    const expenseList = await getTransactions({ type: 'EXPENSE' });
    for (const item of expenseList) {
      expect(item.type).toBe('EXPENSE');
    }
  });

  it('SRS-08: menyaring riwayat transaksi berdasarkan rentang tanggal', async () => {
    const filtered = await getTransactions({
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    });
    for (const item of filtered) {
      const datePart = item.date.split('T')[0];
      expect(datePart >= '2026-09-01').toBe(true);
      expect(datePart <= '2026-09-30').toBe(true);
    }
  });

  it('SRS-09: berhasil memperbarui data transaksi milik pengguna', async () => {
    const created = await createTransaction({
      type: 'EXPENSE',
      amount: 200000,
      date: '2026-09-29',
      description: 'Makan Siang',
    });
    expect(created.success).toBe(true);
    const id = created.data!.id;

    const updated = await updateTransaction({
      id,
      type: 'EXPENSE',
      amount: 250000,
      date: '2026-09-29',
      description: 'Makan Siang & Kopi',
    });
    expect(updated.success).toBe(true);
    expect(updated.data?.amount).toBe(250000);
    expect(updated.data?.description).toBe('Makan Siang & Kopi');
  });

  it('SRS-10: menolak perubahan transaksi jika ID tidak ditemukan atau milik user lain', async () => {
    const result = await updateTransaction({
      id: 'tx-non-existent-user-id',
      type: 'INCOME',
      amount: 50000,
      date: '2026-09-29',
      description: 'Illegal edit attempt',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Akses ditolak');
  });

  it('SRS-10: menolak penghapusan transaksi jika ID tidak ditemukan atau milik user lain', async () => {
    const result = await deleteTransaction('tx-non-existent-user-id');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Akses ditolak');
  });
});
