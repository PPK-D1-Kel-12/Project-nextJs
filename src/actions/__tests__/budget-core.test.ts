import { describe, it, expect, beforeEach } from 'vitest';
import {
  setMonthlyBudget,
  getCurrentBudget,
  getUserBudgets,
  deleteBudget,
  _setTestUserContext,
  _resetMemoryBudgets,
} from '@/actions/budget';

describe('Budget Core Actions & Data Isolation (SRS-11 & SRS-15)', () => {
  beforeEach(async () => {
    await _resetMemoryBudgets();
    _setTestUserContext({
      id: 'user-angga-001',
      name: 'Angga',
      email: 'angga@example.com',
    });
  });

  it('SRS-11: menolak penetapan budget jika targetAmount <= 0', async () => {
    const result = await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: 0,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Nominal target anggaran wajib bernilai positif');

    const negativeResult = await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: -500000,
    });
    expect(negativeResult.success).toBe(false);
    expect(negativeResult.error).toContain('Nominal target anggaran wajib bernilai positif');
  });

  it('SRS-11: menolak penetapan budget jika bulan atau tahun tidak valid', async () => {
    const invalidMonth = await setMonthlyBudget({
      month: 13,
      year: 2026,
      targetAmount: 2000000,
    });
    expect(invalidMonth.success).toBe(false);
    expect(invalidMonth.error).toContain('Bulan tidak valid');

    const invalidYear = await setMonthlyBudget({
      month: 5,
      year: 1999,
      targetAmount: 2000000,
    });
    expect(invalidYear.success).toBe(false);
    expect(invalidYear.error).toContain('Tahun tidak valid');
  });

  it('SRS-11: berhasil menetapkan target budget bulanan baru', async () => {
    const result = await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: 3500000,
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.targetAmount).toBe(3500000);
    expect(result.data?.month).toBe(10);
    expect(result.data?.year).toBe(2026);
    expect(result.data?.userId).toBe('user-angga-001');

    const fetched = await getCurrentBudget({ month: 10, year: 2026 });
    expect(fetched.success).toBe(true);
    expect(fetched.data?.targetAmount).toBe(3500000);
  });

  it('SRS-11: melakukan upsert (memperbarui budget yang sudah ada pada periode yang sama)', async () => {
    await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: 3000000,
    });

    const updated = await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: 4500000,
    });
    expect(updated.success).toBe(true);
    expect(updated.data?.targetAmount).toBe(4500000);

    const list = await getUserBudgets();
    const octBudgets = list.filter((b) => b.month === 10 && b.year === 2026);
    expect(octBudgets.length).toBe(1);
    expect(octBudgets[0].targetAmount).toBe(4500000);
  });

  it('SRS-15: Isolasi Data - Pengguna hanya dapat melihat budget miliknya sendiri', async () => {
    // User A menetapkan budget Oktober 2026
    _setTestUserContext({
      id: 'user-angga-001',
      name: 'Angga',
      email: 'angga@example.com',
    });
    await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: 5000000,
    });

    // Beralih ke User B (Bella)
    _setTestUserContext({
      id: 'user-bella-002',
      name: 'Bella',
      email: 'bella@example.com',
    });

    // User B cek budget Oktober 2026 -> harus null (bukan data milik User A)
    const bellaBudget = await getCurrentBudget({ month: 10, year: 2026 });
    expect(bellaBudget.success).toBe(true);
    expect(bellaBudget.data).toBeNull();

    // User B menetapkan budget Oktober 2026 miliknya sendiri
    await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: 2000000,
    });

    const bellaList = await getUserBudgets();
    expect(bellaList.length).toBe(1);
    expect(bellaList[0].targetAmount).toBe(2000000);
    expect(bellaList[0].userId).toBe('user-bella-002');

    // Beralih kembali ke User A -> data User A tidak berubah
    _setTestUserContext({
      id: 'user-angga-001',
      name: 'Angga',
      email: 'angga@example.com',
    });
    const anggaBudget = await getCurrentBudget({ month: 10, year: 2026 });
    expect(anggaBudget.data?.targetAmount).toBe(5000000);
  });

  it('SRS-15: Isolasi Data - Pengguna tidak dapat menghapus budget milik pengguna lain', async () => {
    // User A membuat budget
    _setTestUserContext({
      id: 'user-angga-001',
      name: 'Angga',
      email: 'angga@example.com',
    });
    const created = await setMonthlyBudget({
      month: 11,
      year: 2026,
      targetAmount: 3000000,
    });
    const budgetId = created.data!.id;

    // User B mencoba menghapus budget milik User A
    _setTestUserContext({
      id: 'user-bella-002',
      name: 'Bella',
      email: 'bella@example.com',
    });
    const deleteAttempt = await deleteBudget(budgetId);
    expect(deleteAttempt.success).toBe(false);
    expect(deleteAttempt.error).toContain('Akses ditolak');

    // User A menghapus budget miliknya sendiri -> berhasil
    _setTestUserContext({
      id: 'user-angga-001',
      name: 'Angga',
      email: 'angga@example.com',
    });
    const deleteSuccess = await deleteBudget(budgetId);
    expect(deleteSuccess.success).toBe(true);

    const recheck = await getCurrentBudget({ month: 11, year: 2026 });
    expect(recheck.data).toBeNull();
  });
});
