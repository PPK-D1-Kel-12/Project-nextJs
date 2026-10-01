'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { validAmount, validMonth, type BudgetData, type BudgetResult } from '@/lib/budgets';

interface MemoryAccount { id: string; name: string }
interface MemoryCategory { id: string; name: string }
interface MemoryAllocation { id: string; account_id: string; category_id: string; month: string; amount: number }
interface MemoryBudgetUser {
  accounts: MemoryAccount[];
  categories: MemoryCategory[];
  allocations: MemoryAllocation[];
}

const globalForMultiBudgetMemory = globalThis as unknown as {
  _demoBudgetData?: Map<string, MemoryBudgetUser>;
};
if (!globalForMultiBudgetMemory._demoBudgetData) {
  globalForMultiBudgetMemory._demoBudgetData = new Map();
}
const demoBudgetData = globalForMultiBudgetMemory._demoBudgetData;

function getDemoUserData(userId: string): MemoryBudgetUser {
  if (!demoBudgetData.has(userId)) {
    demoBudgetData.set(userId, {
      accounts: [
        { id: 'acc-bca-001', name: 'BCA Tabungan' },
        { id: 'acc-cash-002', name: 'Dompet / Tunai' },
        { id: 'acc-gopay-003', name: 'GoPay' },
      ],
      categories: [
        { id: 'cat-makan-001', name: 'Makanan & Minuman' },
        { id: 'cat-trans-002', name: 'Transportasi' },
        { id: 'cat-belanja-003', name: 'Kebutuhan Harian' },
      ],
      allocations: [],
    });
  }
  return demoBudgetData.get(userId)!;
}

function safeRevalidatePath(path: string, type?: 'page' | 'layout') {
  try {
    if (type) {
      revalidatePath(path, type);
    } else {
      revalidatePath(path);
    }
  } catch {
    // Ignore cache revalidation outside request context
  }
}

async function context() {
  // Check if active demo session cookie exists
  try {
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get('demo_auth_session');
    if (demoCookie?.value) {
      try {
        const parsed = JSON.parse(demoCookie.value);
        return { client: null, user: { id: parsed.id || 'demo-user-bram-001' }, isDemo: true };
      } catch {
        return { client: null, user: { id: 'demo-user-bram-001' }, isDemo: true };
      }
    }
  } catch {
    // In Vitest or outside request context
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
    throw new Error('Anggaran memerlukan koneksi Supabase. Konfigurasi Supabase belum tersedia.');
  }
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error('Silakan masuk dengan akun Supabase untuk mengelola anggaran.');
  return { client, user, isDemo: false };
}

function databaseError(error: { code?: string; message?: string }) {
  if (error.code === '23505') return 'Data sudah ada. Untuk rekening, kategori, dan bulan yang sama, ubah alokasi yang tersedia.';
  if (error.code === '23503') return 'Rekening/kategori tidak tersedia atau masih digunakan oleh alokasi. Hapus alokasinya terlebih dahulu.';
  if (error.code === '42P01' || error.code === 'PGRST205') return 'Tabel anggaran belum tersedia. Jalankan migrasi multi-budget pada database.';
  return error.message || 'Gagal menyimpan atau memuat anggaran. Silakan coba lagi.';
}

export async function getBudgetData(month: string): Promise<BudgetData> {
  if (!validMonth(month)) throw new Error('Bulan tidak valid.');
  const ctx = await context();

  if (ctx.isDemo) {
    const userData = getDemoUserData(ctx.user.id);
    const targetMonth = `${month}-01`;
    const allocations = userData.allocations
      .filter((a) => a.month === targetMonth)
      .map((a) => ({ ...a }));
    return {
      accounts: [...userData.accounts],
      categories: [...userData.categories],
      allocations,
    };
  }

  const client = ctx.client!;
  const user = ctx.user;
  const results = await Promise.all([
    client.from('budget_accounts').select('id,name').eq('user_id', user.id).order('name'),
    client.from('budget_categories').select('id,name').eq('user_id', user.id).order('name'),
    client.from('budget_allocations').select('id,account_id,category_id,month,amount').eq('user_id', user.id).eq('month', `${month}-01`).order('created_at'),
  ]);
  for (const result of results) if (result.error) throw new Error(databaseError(result.error));
  return {
    accounts: results[0].data ?? [],
    categories: results[1].data ?? [],
    allocations: (results[2].data ?? []).map((item) => ({ ...item, amount: Number(item.amount) })),
  };
}

export async function saveBudget(_previous: BudgetResult, form: FormData): Promise<BudgetResult> {
  try {
    const ctx = await context();
    const operation = String(form.get('operation') ?? '');
    const id = String(form.get('id') ?? '');

    if (ctx.isDemo) {
      const userData = getDemoUserData(ctx.user.id);
      if (operation === 'account' || operation === 'category') {
        const name = String(form.get('name') ?? '').trim();
        if (!name || name.length > 80) return { success: false, message: 'Nama wajib diisi, maksimal 80 karakter.' };
        const list = operation === 'account' ? userData.accounts : userData.categories;
        if (list.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
          return { success: false, message: 'Data sudah ada. Gunakan nama yang berbeda.' };
        }
        list.push({ id: crypto.randomUUID(), name });
      } else if (operation === 'allocation') {
        const month = String(form.get('month') ?? '');
        const amount = Number(form.get('amount'));
        const accountId = String(form.get('account_id') ?? '');
        const categoryId = String(form.get('category_id') ?? '');
        if (!validMonth(month) || !validAmount(amount) || !accountId || !categoryId) {
          return { success: false, message: 'Pilih bulan, rekening, kategori, dan nominal rupiah bulat antara 1–1.000.000.000.000.' };
        }
        const targetMonth = `${month}-01`;
        if (id) {
          const index = userData.allocations.findIndex((a) => a.id === id);
          if (index === -1) return { success: false, message: 'Alokasi tidak ditemukan atau bukan milik Anda.' };
          userData.allocations[index] = { id, account_id: accountId, category_id: categoryId, month: targetMonth, amount };
        } else {
          const exists = userData.allocations.some(
            (a) => a.month === targetMonth && a.account_id === accountId && a.category_id === categoryId
          );
          if (exists) return { success: false, message: 'Data sudah ada. Untuk rekening, kategori, dan bulan yang sama, ubah alokasi yang tersedia.' };
          userData.allocations.push({ id: crypto.randomUUID(), account_id: accountId, category_id: categoryId, month: targetMonth, amount });
        }
      } else if (operation === 'delete-account') {
        const inUse = userData.allocations.some((a) => a.account_id === id);
        if (inUse) return { success: false, message: 'Rekening tidak tersedia atau masih digunakan oleh alokasi. Hapus alokasinya terlebih dahulu.' };
        const index = userData.accounts.findIndex((a) => a.id === id);
        if (index === -1) return { success: false, message: 'Data tidak ditemukan atau bukan milik Anda.' };
        userData.accounts.splice(index, 1);
      } else if (operation === 'delete-category') {
        const inUse = userData.allocations.some((a) => a.category_id === id);
        if (inUse) return { success: false, message: 'Kategori tidak tersedia atau masih digunakan oleh alokasi. Hapus alokasinya terlebih dahulu.' };
        const index = userData.categories.findIndex((a) => a.id === id);
        if (index === -1) return { success: false, message: 'Data tidak ditemukan atau bukan milik Anda.' };
        userData.categories.splice(index, 1);
      } else if (operation === 'delete-allocation') {
        const index = userData.allocations.findIndex((a) => a.id === id);
        if (index === -1) return { success: false, message: 'Data tidak ditemukan atau bukan milik Anda.' };
        userData.allocations.splice(index, 1);
      } else {
        return { success: false, message: 'Operasi tidak valid.' };
      }

      safeRevalidatePath('/budgets');
      return { success: true, message: operation.startsWith('delete-') ? 'Data berhasil dihapus.' : 'Data anggaran berhasil disimpan.' };
    }

    const client = ctx.client!;
    const user = ctx.user;
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
    safeRevalidatePath('/budgets');
    return { success: true, message: operation.startsWith('delete-') ? 'Data berhasil dihapus.' : 'Data anggaran berhasil disimpan.' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Gagal menyimpan anggaran.' };
  }
}
