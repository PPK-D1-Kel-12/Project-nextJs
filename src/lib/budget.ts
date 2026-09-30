export type BudgetStatus = 'SAFE' | 'WARNING' | 'OVER_BUDGET' | 'NO_BUDGET';

export interface BudgetAnalyticsSummary {
  month: number; // 1 - 12
  year: number;
  monthName: string;
  targetBudget: number;
  actualExpense: number;
  remainingBudget: number;
  percentageUsed: number;
  status: BudgetStatus;
  hasBudget: boolean;
}

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Pure calculation logic untuk evaluasi status dan metrik anggaran (SRS-13 & SRS-14)
 */
export function calculateBudgetMetrics(
  targetBudget: number,
  actualExpense: number
): {
  targetBudget: number;
  actualExpense: number;
  remainingBudget: number;
  percentageUsed: number;
  status: BudgetStatus;
  hasBudget: boolean;
} {
  const sanitizedTarget = Math.max(0, targetBudget);
  const sanitizedExpense = Math.max(0, actualExpense);

  if (sanitizedTarget <= 0) {
    return {
      targetBudget: 0,
      actualExpense: sanitizedExpense,
      remainingBudget: -sanitizedExpense,
      percentageUsed: 0,
      status: 'NO_BUDGET',
      hasBudget: false,
    };
  }

  const remainingBudget = sanitizedTarget - sanitizedExpense;
  const percentageUsed = Math.round((sanitizedExpense / sanitizedTarget) * 100);

  let status: BudgetStatus = 'SAFE';
  if (sanitizedExpense > sanitizedTarget) {
    status = 'OVER_BUDGET';
  } else if (percentageUsed >= 80) {
    status = 'WARNING';
  }

  return {
    targetBudget: sanitizedTarget,
    actualExpense: sanitizedExpense,
    remainingBudget,
    percentageUsed,
    status,
    hasBudget: true,
  };
}
