import { getCurrentUser } from '@/lib/auth-user';
import { getUserBudgets } from '@/actions/budget';
import { BudgetClient } from './budget-client';
import { getBudgetData } from '@/actions/budgets';
import { validMonth } from '@/lib/budgets';
import { BudgetWorkspace } from './workspace';

export const metadata = { title: 'Anggaran' };

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await getCurrentUser();
  const allBudgets = await getUserBudgets();
  const params = await searchParams;
  const today = new Date();
  const currentMonth = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
  })
    .format(today)
    .slice(0, 7);

  const month = params.month && validMonth(params.month) ? params.month : currentMonth;
  let data;
  let error = '';
  try {
    data = await getBudgetData(month);
  } catch (cause) {
    error = cause instanceof Error ? cause.message : 'Gagal memuat anggaran.';
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <BudgetClient
        key={month}
        initialBudgets={allBudgets}
        currentMonth={Number(month.slice(5, 7))}
        currentYear={Number(month.slice(0, 4))}
        budgetData={data ?? null}
      />

      <section className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 space-y-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Rencana Keuangan & Pos Belanja (SRS-12)
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Alokasi Rekening & Kategori
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Alokasikan dana dari setiap rekening sumber ke kategori pengeluaran bulanan untuk periode {month}.
          </p>
        </div>

        {data ? (
          <BudgetWorkspace key={month} month={month} data={data} />
        ) : (
          <div
            role="alert"
            className="clay-card p-6 bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2"
          >
            <h3 className="font-extrabold text-base">Anggaran belum bisa dimuat</h3>
            <p className="text-xs font-medium">{error}</p>
            <a
              className="clay-btn-secondary inline-block px-4 py-2 text-xs font-bold mt-2"
              href={`/budgets?month=${month}`}
            >
              Coba lagi
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
