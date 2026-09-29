import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDashboardSummary } from '@/actions/transactions';
import { DashboardClient } from './dashboard-client';

export const metadata = {
  title: 'Dashboard - Expense Tracker',
  description: 'Ringkasan keuangan dan arus kas pribadi',
};

export default async function DashboardPage() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect('/login');
      }
    } catch {
      // fallback jika credentials belum diset saat dev lokal
    }
  }

  const summary = await getDashboardSummary();

  return <DashboardClient summary={summary} />;
}
