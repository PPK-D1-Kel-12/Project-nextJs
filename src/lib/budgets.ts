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
