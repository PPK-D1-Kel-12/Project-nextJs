'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-user';
import {
  calculateBudgetMetrics,
  MONTH_NAMES,
  type BudgetStatus,
  type BudgetAnalyticsSummary,
} from '@/lib/budget';
import { getTransactions } from './transactions';

export type { BudgetStatus, BudgetAnalyticsSummary };

// In-memory store untuk target budget bulanan per user (userId -> "year-month" -> amount)
const budgetStore = new Map<string, Map<string, number>>();

function getPeriodKey(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export async function setMonthlyBudgetGoal(
  targetAmount: number,
  month?: number,
  year?: number
): Promise<{ success: boolean; data?: BudgetAnalyticsSummary; error?: string }> {
  const user = await getCurrentUser();
  const now = new Date();
  const targetMonth = month ?? now.getMonth() + 1;
  const targetYear = year ?? now.getFullYear();

  if (targetAmount < 0) {
    return { success: false, error: 'Target anggaran tidak boleh bernilai negatif.' };
  }

  if (!budgetStore.has(user.id)) {
    budgetStore.set(user.id, new Map());
  }

  const userBudgets = budgetStore.get(user.id)!;
  const periodKey = getPeriodKey(targetMonth, targetYear);
  userBudgets.set(periodKey, targetAmount);

  try {
    revalidatePath('/dashboard');
    revalidatePath('/budgets');
  } catch {
    // Ignore outside request lifecycle
  }

  const summary = await getMonthlyBudgetSummary(targetMonth, targetYear);
  return { success: true, data: summary };
}

/**
 * Server Action: Mengambil ringkasan anggaran bulanan & indikator visual (SRS-13 & SRS-14)
 */
export async function getMonthlyBudgetSummary(
  month?: number,
  year?: number
): Promise<BudgetAnalyticsSummary> {
  const user = await getCurrentUser();
  const now = new Date();
  const targetMonth = month ?? now.getMonth() + 1;
  const targetYear = year ?? now.getFullYear();
  const monthName = MONTH_NAMES[targetMonth - 1] || 'Bulan Berjalan';

  // 1. Ambil target budget (default: Rp 3.000.000 jika belum pernah diubah agar demo dashboard langsung interaktif)
  const periodKey = getPeriodKey(targetMonth, targetYear);
  const userBudgets = budgetStore.get(user.id);
  let targetAmount = userBudgets?.get(periodKey);

  if (targetAmount === undefined) {
    // Berikan default target Rp 3.000.000 agar pengguna dapat melihat indikator bekerja
    targetAmount = 3000000;
    if (!budgetStore.has(user.id)) {
      budgetStore.set(user.id, new Map());
    }
    budgetStore.get(user.id)!.set(periodKey, targetAmount);
  }

  // 2. Ambil transaksi pengguna dan akumulasikan pengeluaran pada bulan & tahun target
  const allTransactions = await getTransactions();
  
  let actualExpense = 0;
  for (const tx of allTransactions) {
    if (tx.type !== 'EXPENSE') continue;

    // tx.date format YYYY-MM-DD
    const txDate = new Date(tx.date);
    if (!isNaN(txDate.getTime())) {
      const txMonth = txDate.getMonth() + 1;
      const txYear = txDate.getFullYear();
      if (txMonth === targetMonth && txYear === targetYear) {
        actualExpense += Number(tx.amount);
      }
    }
  }

  // 3. Hitung metrik analitik & status
  const metrics = calculateBudgetMetrics(targetAmount, actualExpense);

  return {
    month: targetMonth,
    year: targetYear,
    monthName,
    ...metrics,
  };
}
