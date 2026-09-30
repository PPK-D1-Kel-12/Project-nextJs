import { getBudgetData } from '@/actions/budgets';
import { validMonth } from '@/lib/budgets';
import { BudgetWorkspace } from './workspace';

export const metadata = { title: 'Anggaran' };

export default async function BudgetsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const params = await searchParams;
  const today = new Date();
  const currentMonth = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' }).format(today).slice(0, 7);
  const month = params.month && validMonth(params.month) ? params.month : currentMonth;
  let data;
  let error = '';
  try { data = await getBudgetData(month); }
  catch (cause) { error = cause instanceof Error ? cause.message : 'Gagal memuat anggaran.'; }

  return <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Rencana keuangan</p>
        <h1 className="text-3xl font-bold mt-1">Anggaran</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Alokasikan dana dari setiap rekening ke kategori pengeluaran bulanan.</p></div>
      <form className="flex items-end gap-2">
        <label className="text-sm font-medium">Periode<input className="block mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" type="month" name="month" defaultValue={month} min="2000-01" max="9999-12" required /></label>
        <button className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2">Tampilkan</button>
      </form>
    </div>
    {data ? <BudgetWorkspace key={month} month={month} data={data} /> :
      <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 p-6"><h2 className="font-semibold">Anggaran belum bisa dimuat</h2><p className="mt-2">{error}</p><a className="inline-block mt-4 underline" href={`/budgets?month=${month}`}>Coba lagi</a></div>}
  </main>;
}
