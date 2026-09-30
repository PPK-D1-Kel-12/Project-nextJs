'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { validAmount, validMonth, type BudgetData, type BudgetResult } from '@/lib/budgets';

async function context() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
    throw new Error('Anggaran memerlukan koneksi Supabase. Konfigurasi Supabase belum tersedia.');
  }
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error('Silakan masuk dengan akun Supabase untuk mengelola anggaran.');
  return { client, user };
}

function databaseError(error: { code?: string }) {
  if (error.code === '23505') return 'Data sudah ada. Untuk rekening, kategori, dan bulan yang sama, ubah alokasi yang tersedia.';
  if (error.code === '23503') return 'Rekening/kategori tidak tersedia atau masih digunakan oleh alokasi. Hapus alokasinya terlebih dahulu.';
  if (error.code === '42P01' || error.code === 'PGRST205') return 'Tabel anggaran belum tersedia. Jalankan migrasi multi-budget pada database.';
  return 'Gagal menyimpan atau memuat anggaran. Silakan coba lagi.';
}

export async function getBudgetData(month: string): Promise<BudgetData> {
  if (!validMonth(month)) throw new Error('Bulan tidak valid.');
  const { client, user } = await context();
  const results = await Promise.all([
    client.from('budget_accounts').select('id,name').eq('user_id', user.id).order('name'),
    client.from('budget_categories').select('id,name').eq('user_id', user.id).order('name'),
    client.from('budget_allocations').select('id,account_id,category_id,month,amount').eq('user_id', user.id).eq('month', `${month}-01`).order('created_at'),
  ]);
  for (const result of results) if (result.error) throw new Error(databaseError(result.error));
  return { accounts: results[0].data ?? [], categories: results[1].data ?? [],
    allocations: (results[2].data ?? []).map((item) => ({ ...item, amount: Number(item.amount) })) };
}

export async function saveBudget(_previous: BudgetResult, form: FormData): Promise<BudgetResult> {
  try {
    const { client, user } = await context();
    const operation = String(form.get('operation') ?? '');
    const id = String(form.get('id') ?? '');
    let error;
    if (operation === 'account' || operation === 'category') {
      const name = String(form.get('name') ?? '').trim();
      if (!name || name.length > 80) return { success: false, message: 'Nama wajib diisi, maksimal 80 karakter.' };
      ({ error } = await client.from(operation === 'account' ? 'budget_accounts' : 'budget_categories').insert({ user_id: user.id, name }));
    } else if (operation === 'allocation') {
      const month = String(form.get('month') ?? '');
      const amount = Number(form.get('amount'));
      const accountId = String(form.get('account_id') ?? '');
      const categoryId = String(form.get('category_id') ?? '');
      if (!validMonth(month) || !validAmount(amount) || !accountId || !categoryId) {
        return { success: false, message: 'Pilih bulan, rekening, kategori, dan nominal rupiah bulat antara 1–1.000.000.000.000.' };
      }
      // Composite foreign keys also enforce ownership atomically in PostgreSQL.
      const record = { user_id: user.id, account_id: accountId, category_id: categoryId, month: `${month}-01`, amount };
      const query = id
        ? client.from('budget_allocations').update(record).eq('id', id).eq('user_id', user.id)
        : client.from('budget_allocations').insert(record);
      const result = await query.select('id');
      error = result.error;
      if (!error && !result.data?.length) return { success: false, message: 'Alokasi tidak ditemukan atau bukan milik Anda.' };
    } else if (['delete-account', 'delete-category', 'delete-allocation'].includes(operation) && id) {
      const table = operation === 'delete-account' ? 'budget_accounts' : operation === 'delete-category' ? 'budget_categories' : 'budget_allocations';
      const result = await client.from(table).delete().eq('id', id).eq('user_id', user.id).select('id');
      error = result.error;
      if (!error && !result.data?.length) return { success: false, message: 'Data tidak ditemukan atau bukan milik Anda.' };
    } else return { success: false, message: 'Operasi tidak valid.' };
    if (error) return { success: false, message: databaseError(error) };
    revalidatePath('/budgets');
    return { success: true, message: operation.startsWith('delete-') ? 'Data berhasil dihapus.' : 'Data anggaran berhasil disimpan.' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Gagal menyimpan anggaran.' };
  }
}
