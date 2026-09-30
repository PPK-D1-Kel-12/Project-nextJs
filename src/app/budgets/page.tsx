import { getCurrentUser } from '@/lib/auth-user';
import { getUserBudgets } from '@/actions/budget';
import { BudgetClient } from './budget-client';

export const metadata = {
  title: 'Anggaran Bulanan - Expense Tracker',
  description: 'Pengaturan dan pemantauan target anggaran bulanan',
};

export default async function BudgetsPage() {
  await getCurrentUser();
  const allBudgets = await getUserBudgets();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return (
    <BudgetClient
      initialBudgets={allBudgets}
      currentMonth={currentMonth}
      currentYear={currentYear}
    />
  );
}
