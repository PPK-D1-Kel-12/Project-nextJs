'use client';

import { useActionState, useState, type ReactNode } from 'react';
import { saveBudget } from '@/actions/budgets';
import { summarizeBudget, type BudgetData, type BudgetAllocation } from '@/lib/budgets';
import { formatRupiah } from '@/lib/format';

const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm';
const panelClass = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5';

function ActionForm({ children, label, confirm, disabled = false }: { children: ReactNode; label: string; confirm?: string; disabled?: boolean }) {
  const [state, action, pending] = useActionState(saveBudget, { success: false, message: '' });
  return <form action={action} onSubmit={(event) => { if (confirm && !window.confirm(confirm)) event.preventDefault(); }} className="space-y-3">
    <fieldset disabled={pending || disabled} className="space-y-3 disabled:opacity-60">
      {children}
      <button className="rounded-lg px-4 py-2 text-sm font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 disabled:opacity-50" type="submit" disabled={pending || disabled}>{pending ? 'Memproses…' : label}</button>
    </fieldset>
    {state.message && <p role={state.success ? 'status' : 'alert'} className={`text-sm ${state.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{state.message}</p>}
  </form>;
}

function AllocationForm({ data, month, item }: { data: BudgetData; month: string; item?: BudgetAllocation }) {
  const disabled = !data.accounts.length || !data.categories.length;
  return <ActionForm label={item ? 'Simpan perubahan' : 'Tambah alokasi'} disabled={disabled}>
    <input type="hidden" name="operation" value="allocation" />
    <input type="hidden" name="month" value={month} />
    <input type="hidden" name="id" value={item?.id ?? ''} />
    <div className="grid sm:grid-cols-3 gap-3">
      <label className="text-sm font-medium">Rekening / sumber dana<select name="account_id" className={inputClass} defaultValue={item?.account_id ?? ''} required><option value="" disabled>Pilih rekening</option>{data.accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>
      <label className="text-sm font-medium">Kategori<select name="category_id" className={inputClass} defaultValue={item?.category_id ?? ''} required><option value="" disabled>Pilih kategori</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="text-sm font-medium">Alokasi (Rp)<input name="amount" type="number" min="1" max="1000000000000" step="1" defaultValue={item?.amount} placeholder="500000" required className={inputClass} /></label>
    </div>
    {disabled && <p className="text-sm text-amber-700 dark:text-amber-400">Tambahkan rekening dan kategori terlebih dahulu.</p>}
  </ActionForm>;
}

export function BudgetWorkspace({ data, month }: { data: BudgetData; month: string }) {
  const [editing, setEditing] = useState<string | null>(null);
  const summary = summarizeBudget(data);
  return (
    <div className="space-y-6">
      <section className="grid sm:grid-cols-3 gap-4" aria-label="Ringkasan anggaran">
        {[['Total alokasi bulan ini', formatRupiah(summary.total)], ['Rekening / sumber dana', data.accounts.length], ['Kategori pengeluaran', data.categories.length]].map(([label, value]) => <div key={label} className={panelClass}><p className="text-sm text-slate-500 dark:text-slate-400">{label}</p><p className="text-2xl font-bold mt-2">{value}</p></div>)}
      </section>
      <section className={panelClass}><h2 className="text-lg font-semibold mb-1">Alokasi baru · {month}</h2><p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Satu kategori dapat menerima dana dari beberapa rekening. Alokasi adalah rencana, bukan transfer atau transaksi pengeluaran.</p><AllocationForm data={data} month={month} /></section>
      <section className={panelClass}><h2 className="text-lg font-semibold mb-4">Daftar alokasi</h2>
        {!data.allocations.length ? <div className="text-center py-8 text-slate-500 dark:text-slate-400"><p className="font-medium">Belum ada alokasi untuk bulan ini</p><p className="text-sm mt-1">Misalnya, alokasikan Rp500.000 dari rekening gaji ke kategori Makanan.</p></div> :
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">{data.allocations.map((item) => {
            const account = data.accounts.find((entry) => entry.id === item.account_id)?.name;
            const category = data.categories.find((entry) => entry.id === item.category_id)?.name;
            return <li key={item.id} className="py-4 space-y-4"><div className="flex flex-wrap justify-between items-center gap-4"><div><h3 className="font-semibold">{category}</h3><p className="text-sm text-slate-500 dark:text-slate-400">Dari {account}</p></div><div className="flex flex-wrap items-center gap-4"><span className="font-semibold">{formatRupiah(item.amount)}</span><button type="button" aria-expanded={editing === item.id} onClick={() => setEditing(editing === item.id ? null : item.id)} className="text-sm underline cursor-pointer">{editing === item.id ? 'Tutup' : 'Ubah'}</button><ActionForm label="Hapus" confirm={`Hapus alokasi ${category} dari ${account} untuk ${month}?`}><input type="hidden" name="operation" value="delete-allocation" /><input type="hidden" name="id" value={item.id} /></ActionForm></div></div>{editing === item.id && <AllocationForm key={`${item.id}-${item.amount}-${item.account_id}-${item.category_id}`} data={data} month={month} item={item} />}</li>;
          })}</ul>}
      </section>
      <div className="grid md:grid-cols-2 gap-6">{(['account', 'category'] as const).map((kind) => {
        const items = kind === 'account' ? summary.accounts : summary.categories;
        const title = kind === 'account' ? 'Rekening / sumber dana' : 'Kategori pengeluaran';
        return <section key={kind} className={panelClass}><h2 className="text-lg font-semibold">{title}</h2><p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Total alokasi per {kind === 'account' ? 'rekening' : 'kategori'} pada {month}.</p>
          <ActionForm label={kind === 'account' ? 'Tambah rekening' : 'Tambah kategori'}><input type="hidden" name="operation" value={kind} /><label className="text-sm font-medium">Nama {kind === 'account' ? 'rekening' : 'kategori'}<input className={inputClass} name="name" required maxLength={80} placeholder={kind === 'account' ? 'Contoh: BCA, Tunai, GoPay' : 'Contoh: Makanan, Transportasi'} /></label></ActionForm>
          {!items.length && <p className="text-sm text-slate-500 mt-5">Belum ada {kind === 'account' ? 'rekening' : 'kategori'}.</p>}
          <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">{items.map((item) => <li key={item.id} className="py-3 flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium break-words">{item.name}</p><p className="text-sm text-slate-500 dark:text-slate-400">{formatRupiah(item.total)}</p></div><ActionForm label="Hapus" confirm={`Hapus ${item.name}? Data yang masih digunakan oleh alokasi tidak dapat dihapus.`}><input type="hidden" name="operation" value={`delete-${kind}`} /><input type="hidden" name="id" value={item.id} /></ActionForm></li>)}</ul>
        </section>;
      })}</div>
    </div>
  );
}
