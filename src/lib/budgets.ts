export interface BudgetEntity { id: string; name: string }
export interface BudgetAllocation {
  id: string;
  account_id: string;
  category_id: string;
  month: string;
  amount: number;
}
export interface BudgetData {
  accounts: BudgetEntity[];
  categories: BudgetEntity[];
  allocations: BudgetAllocation[];
}
export interface BudgetResult { success: boolean; message: string }

export function validMonth(value: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && Number(value.slice(0, 4)) >= 2000;
}

export function validAmount(value: number) {
  return Number.isSafeInteger(value) && value > 0 && value <= 1_000_000_000_000;
}

export function summarizeBudget(data: BudgetData) {
  return {
    total: data.allocations.reduce((sum, item) => sum + item.amount, 0),
    accounts: data.accounts.map((account) => ({ ...account,
      total: data.allocations.filter((item) => item.account_id === account.id).reduce((sum, item) => sum + item.amount, 0),
    })),
    categories: data.categories.map((category) => ({ ...category,
      total: data.allocations.filter((item) => item.category_id === category.id).reduce((sum, item) => sum + item.amount, 0),
    })),
  };
}

export interface BudgetComparison {
  targetBudget: number;
  totalAllocated: number;
  unallocatedAmount: number;
  allocationPercentage: number;
  status: 'UNDER_ALLOCATED' | 'BALANCED' | 'OVER_ALLOCATED' | 'NO_TARGET';
}

export function compareMonthlyBudgetWithAllocations(
  targetBudget: number,
  data: BudgetData
): BudgetComparison {
  const totalAllocated = (data?.allocations ?? []).reduce((sum, item) => sum + item.amount, 0);

  if (targetBudget <= 0) {
    return {
      targetBudget: 0,
      totalAllocated,
      unallocatedAmount: -totalAllocated,
      allocationPercentage: totalAllocated > 0 ? 100 : 0,
      status: 'NO_TARGET',
    };
  }

  const unallocatedAmount = targetBudget - totalAllocated;
  const allocationPercentage = Math.round((totalAllocated / targetBudget) * 100);

  let status: BudgetComparison['status'] = 'UNDER_ALLOCATED';
  if (totalAllocated === targetBudget) {
    status = 'BALANCED';
  } else if (totalAllocated > targetBudget) {
    status = 'OVER_ALLOCATED';
  }

  return {
    targetBudget,
    totalAllocated,
    unallocatedAmount,
    allocationPercentage,
    status,
  };
}

