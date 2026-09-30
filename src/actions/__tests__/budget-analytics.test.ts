import { describe, it, expect } from 'vitest';
import { calculateBudgetMetrics } from '@/lib/budget';
import {
  getMonthlyBudgetSummary,
  setMonthlyBudgetGoal,
} from '../budget-analytics';

describe('SRS-13 & SRS-14: Budget Analytics & Visual Indicator', () => {
  describe('calculateBudgetMetrics (Pure Logic)', () => {
    it('harus mengembalikan status SAFE saat pemakaian anggaran < 80%', () => {
      // Budget: Rp 1.000.000, Pengeluaran: Rp 500.000 (50%)
      const result = calculateBudgetMetrics(1000000, 500000);

      expect(result.status).toBe('SAFE');
      expect(result.percentageUsed).toBe(50);
      expect(result.remainingBudget).toBe(500000);
      expect(result.hasBudget).toBe(true);
    });

    it('harus mengembalikan status WARNING saat pemakaian anggaran mencapai 80%', () => {
      // Budget: Rp 1.000.000, Pengeluaran: Rp 800.000 (80%)
      const result = calculateBudgetMetrics(1000000, 800000);

      expect(result.status).toBe('WARNING');
      expect(result.percentageUsed).toBe(80);
      expect(result.remainingBudget).toBe(200000);
    });

    it('harus mengembalikan status WARNING saat pemakaian anggaran antara 80% dan 100%', () => {
      // Budget: Rp 2.000.000, Pengeluaran: Rp 1.900.000 (95%)
      const result = calculateBudgetMetrics(2000000, 1900000);

      expect(result.status).toBe('WARNING');
      expect(result.percentageUsed).toBe(95);
      expect(result.remainingBudget).toBe(100000);
    });

    it('harus mengembalikan status OVER_BUDGET saat pengeluaran melampaui target anggaran', () => {
      // Budget: Rp 1.000.000, Pengeluaran: Rp 1.200.000 (120%)
      const result = calculateBudgetMetrics(1000000, 1200000);

      expect(result.status).toBe('OVER_BUDGET');
      expect(result.percentageUsed).toBe(120);
      expect(result.remainingBudget).toBe(-200000);
    });

    it('harus menangani kasus target anggaran bernilai 0 atau belum diset (NO_BUDGET)', () => {
      const result = calculateBudgetMetrics(0, 150000);

      expect(result.status).toBe('NO_BUDGET');
      expect(result.hasBudget).toBe(false);
      expect(result.percentageUsed).toBe(0);
      expect(result.remainingBudget).toBe(-150000);
    });

    it('harus menangani saat belum ada pengeluaran sama sekali (0%)', () => {
      const result = calculateBudgetMetrics(2500000, 0);

      expect(result.status).toBe('SAFE');
      expect(result.percentageUsed).toBe(0);
      expect(result.remainingBudget).toBe(2500000);
    });
  });

  describe('Server Actions Integration', () => {
    it('harus berhasil menetapkan dan mengambil target budget bulanan baru', async () => {
      const month = 10;
      const year = 2026;
      const newTarget = 5000000;

      const setRes = await setMonthlyBudgetGoal(newTarget, month, year);
      expect(setRes.success).toBe(true);
      expect(setRes.data?.targetBudget).toBe(newTarget);

      const summary = await getMonthlyBudgetSummary(month, year);
      expect(summary.targetBudget).toBe(newTarget);
      expect(summary.month).toBe(month);
      expect(summary.year).toBe(year);
      expect(summary.monthName).toBe('Oktober');
    });

    it('harus menolak target budget bernilai negatif', async () => {
      const setRes = await setMonthlyBudgetGoal(-100000, 10, 2026);
      expect(setRes.success).toBe(false);
      expect(setRes.error).toContain('tidak boleh bernilai negatif');
    });
  });
});
