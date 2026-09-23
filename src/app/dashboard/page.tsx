import { getDashboardSummary } from '@/actions/transactions';
import { DashboardClient } from './dashboard-client';

export const metadata = {
  title: 'Dashboard - Expense Tracker',
  description: 'Ringkasan keuangan dan arus kas pribadi',
};

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return <DashboardClient summary={summary} />;
}
