'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-user';
import { db } from '@/lib/prisma';

export interface TransactionItem {
  id: string;
  userId: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  description: string;
  createdAt?: string;
}

export interface DashboardSummary {
  userName: string;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactions: TransactionItem[];
}

export interface TransactionFilter {
  type?: 'ALL' | 'INCOME' | 'EXPENSE';
  startDate?: string;
  endDate?: string;
}

export interface CreateTransactionInput {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  description: string;
}

export interface UpdateTransactionInput {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  description: string;
}

interface PrismaOrmTransaction {
  where: (clause: Record<string, unknown>) => {
    all?: () => Promise<Array<Record<string, unknown>>>;
    findMany?: () => Promise<Array<Record<string, unknown>>>;
    update: (params: { data: Record<string, unknown> }) => Promise<unknown>;
    delete: () => Promise<unknown>;
  };
  create: (params: { data: Record<string, unknown> }) => Promise<unknown>;
}

async function getRows(queryObj: any): Promise<Array<Record<string, unknown>>> {
  if (!queryObj) return [];
  if (typeof queryObj.all === 'function') {
    return (await queryObj.all()) || [];
  }
  if (typeof queryObj.findMany === 'function') {
    return (await queryObj.findMany()) || [];
  }
  return [];
}

interface PrismaDbClient {
  orm?: {
    public?: {
      Transaction?: PrismaOrmTransaction;
    };
  };
}

// Global in-memory cache untuk fallback jika PostgreSQL offline saat dev
const globalForMemory = globalThis as unknown as {
  _memoryTransactions?: Map<string, TransactionItem[]>;
};

if (!globalForMemory._memoryTransactions) {
  globalForMemory._memoryTransactions = new Map<string, TransactionItem[]>();
}
const memoryStore = globalForMemory._memoryTransactions;

function getMemoryList(userId: string): TransactionItem[] {
  if (!memoryStore.has(userId)) {
    // Hanya berikan data demo awal untuk kemandirian pengujian Anggota 2 jika user demo
    if (userId === 'demo-user-bram-001') {
      memoryStore.set(userId, [
        {
          id: 'initial-tx-1',
          userId,
          type: 'INCOME',
          amount: 75000000,
          date: new Date().toISOString().split('T')[0],
          description: 'Gaji & Bonus Eksekutif',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'initial-tx-2',
          userId,
          type: 'EXPENSE',
          amount: 15000000,
          date: new Date().toISOString().split('T')[0],
          description: 'Fine Dining & Entertainment',
          createdAt: new Date().toISOString(),
        },
      ]);
    } else {
      memoryStore.set(userId, []);
    }
  }
  return memoryStore.get(userId)!;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const user = await getCurrentUser();

  try {
    if (process.env.DATABASE_URL) {
      const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Transaction;
      if (orm) {
        const rows = await getRows(orm.where({ userId: user.id }));
        if (rows) {
          let income = 0;
          let expense = 0;
          const items: TransactionItem[] = rows.map((r: Record<string, unknown>) => {
            const amt = Number(r.amount);
            if (r.type === 'INCOME') income += amt;
            else expense += amt;
            return {
              id: String(r.id),
              userId: String(r.userId),
              type: r.type as 'INCOME' | 'EXPENSE',
              amount: amt,
              date: typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date as string | number | Date).toISOString().split('T')[0],
              description: String(r.description),
              createdAt: String(r.createdAt || ''),
            };
          });

          items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          return {
            userName: user.name,
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense,
            recentTransactions: items.slice(0, 5),
          };
        }
      }
    }
  } catch (err) {
    console.warn('Prisma DB query failed, using memory store fallback:', err);
  }

  // Memory fallback
  const items = getMemoryList(user.id);
  let income = 0;
  let expense = 0;
  for (const item of items) {
    if (item.type === 'INCOME') income += item.amount;
    else expense += item.amount;
  }

  const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    userName: user.name,
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
    recentTransactions: sorted.slice(0, 5),
  };
}

export async function getTransactions(filter?: TransactionFilter): Promise<TransactionItem[]> {
  const user = await getCurrentUser();
  let list: TransactionItem[] = [];
  let hasDbLoaded = false;

  try {
    if (process.env.DATABASE_URL) {
      const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Transaction;
      if (orm) {
        const rows = await getRows(orm.where({ userId: user.id }));
        if (rows) {
          list = rows.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            userId: String(r.userId),
            type: r.type as 'INCOME' | 'EXPENSE',
            amount: Number(r.amount),
            date: typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date as string | number | Date).toISOString().split('T')[0],
            description: String(r.description),
            createdAt: String(r.createdAt || ''),
          }));
          hasDbLoaded = true;
        }
      }
    }
  } catch (err) {
    console.warn('Prisma DB query failed, using memory store fallback:', err);
  }

  if (!hasDbLoaded) {
    list = [...getMemoryList(user.id)];
  }

  // Apply filters (SRS-08)
  if (filter?.type && filter.type !== 'ALL') {
    list = list.filter((t) => t.type === filter.type);
  }

  if (filter?.startDate) {
    list = list.filter((t) => {
      const datePart = typeof t.date === 'string' ? t.date.split('T')[0] : '';
      return datePart >= filter.startDate!;
    });
  }

  if (filter?.endDate) {
    list = list.filter((t) => {
      const datePart = typeof t.date === 'string' ? t.date.split('T')[0] : '';
      return datePart <= filter.endDate!;
    });
  }

  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return list;
}

export async function createTransaction(input: CreateTransactionInput): Promise<{ success: boolean; error?: string; data?: TransactionItem }> {
  const user = await getCurrentUser();

  if (!input.type || (input.type !== 'INCOME' && input.type !== 'EXPENSE')) {
    return { success: false, error: 'Jenis transaksi wajib Pemasukan atau Pengeluaran.' };
  }

  if (!input.amount || Number(input.amount) <= 0) {
    return { success: false, error: 'Nominal transaksi wajib bernilai positif (> 0).' };
  }

  if (!input.date) {
    return { success: false, error: 'Tanggal transaksi wajib diisi.' };
  }

  if (!input.description || input.description.trim() === '') {
    return { success: false, error: 'Keterangan transaksi wajib diisi.' };
  }

  const newItem: TransactionItem = {
    id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
    userId: user.id,
    type: input.type,
    amount: Number(input.amount),
    date: input.date,
    description: input.description.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    if (process.env.DATABASE_URL) {
      const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Transaction;
      if (orm) {
        await orm.create({
          data: {
            id: newItem.id,
            userId: user.id,
            type: newItem.type,
            amount: newItem.amount,
            date: new Date(newItem.date).toISOString(),
            description: newItem.description,
          },
        });
      }
    }
  } catch (err) {
    console.warn('Prisma DB insert failed, recorded in memory store:', err);
  }

  // Update memory store
  const items = getMemoryList(user.id);
  items.unshift(newItem);

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  return { success: true, data: newItem };
}

export async function updateTransaction(input: UpdateTransactionInput): Promise<{ success: boolean; error?: string; data?: TransactionItem }> {
  const user = await getCurrentUser();

  if (!input.id) {
    return { success: false, error: 'ID Transaksi diperlukan.' };
  }

  if (!input.type || (input.type !== 'INCOME' && input.type !== 'EXPENSE')) {
    return { success: false, error: 'Jenis transaksi wajib Pemasukan atau Pengeluaran.' };
  }

  if (!input.amount || Number(input.amount) <= 0) {
    return { success: false, error: 'Nominal transaksi wajib bernilai positif (> 0).' };
  }

  if (!input.description || input.description.trim() === '') {
    return { success: false, error: 'Keterangan transaksi wajib diisi.' };
  }

  let dbUpdated = false;

  // 1. Coba update via Database PostgreSQL jika aktif
  try {
    if (process.env.DATABASE_URL) {
      const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Transaction;
      if (orm) {
        // Cek keberadaan transaksi dan otorisasi pemilik (SRS-10)
        const rows = await getRows(orm.where({ id: input.id }));
        if (rows && rows.length > 0) {
          const row = rows[0];
          if (String(row.userId) !== user.id) {
            return {
              success: false,
              error: 'Akses ditolak: Anda tidak memiliki izin untuk mengubah transaksi milik pengguna lain.',
            };
          }

          await orm.where({ id: input.id, userId: user.id }).update({
            data: {
              type: input.type,
              amount: Number(input.amount),
              date: new Date(input.date).toISOString(),
              description: input.description.trim(),
            },
          });
          dbUpdated = true;
        }
      }
    }
  } catch (err) {
    console.warn('Prisma DB update failed, falling back to memory store:', err);
  }

  // 2. Sinkronkan ke Memory Store
  const userItems = getMemoryList(user.id);
  const existingIndex = userItems.findIndex((t) => t.id === input.id);

  if (existingIndex !== -1) {
    const updated: TransactionItem = {
      ...userItems[existingIndex],
      type: input.type,
      amount: Number(input.amount),
      date: input.date,
      description: input.description.trim(),
    };
    userItems[existingIndex] = updated;

    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    return { success: true, data: updated };
  }

  if (dbUpdated) {
    const updated: TransactionItem = {
      id: input.id,
      userId: user.id,
      type: input.type,
      amount: Number(input.amount),
      date: input.date,
      description: input.description.trim(),
    };
    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    return { success: true, data: updated };
  }

  // Cek apakah transaksi milik user lain di memory store (SRS-10)
  for (const [otherUserId, otherItems] of memoryStore.entries()) {
    if (otherUserId !== user.id && otherItems.some((t) => t.id === input.id)) {
      return {
        success: false,
        error: 'Akses ditolak: Anda tidak memiliki izin untuk mengubah transaksi milik pengguna lain.',
      };
    }
  }

  return { success: false, error: 'Akses ditolak: Transaksi tidak ditemukan atau bukan milik Anda.' };
}

export async function deleteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();

  if (!id) {
    return { success: false, error: 'ID Transaksi diperlukan.' };
  }

  let dbDeleted = false;

  // 1. Coba hapus via Database PostgreSQL jika aktif
  try {
    if (process.env.DATABASE_URL) {
      const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Transaction;
      if (orm) {
        // Cek otorisasi pemilik di database (SRS-10)
        const rows = await getRows(orm.where({ id }));
        if (rows && rows.length > 0) {
          const row = rows[0];
          if (String(row.userId) !== user.id) {
            return {
              success: false,
              error: 'Akses ditolak: Anda tidak memiliki izin untuk menghapus transaksi milik pengguna lain.',
            };
          }

          await orm.where({ id, userId: user.id }).delete();
          dbDeleted = true;
        }
      }
    }
  } catch (err) {
    console.warn('Prisma DB delete failed, falling back to memory store:', err);
  }

  // 2. Sinkronkan ke Memory Store
  const userItems = getMemoryList(user.id);
  const existingIndex = userItems.findIndex((t) => t.id === id);

  if (existingIndex !== -1) {
    userItems.splice(existingIndex, 1);
    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    return { success: true };
  }

  if (dbDeleted) {
    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    return { success: true };
  }

  // Cek apakah transaksi milik user lain di memory store (SRS-10)
  for (const [otherUserId, otherItems] of memoryStore.entries()) {
    if (otherUserId !== user.id && otherItems.some((t) => t.id === id)) {
      return {
        success: false,
        error: 'Akses ditolak: Anda tidak memiliki izin untuk menghapus transaksi milik pengguna lain.',
      };
    }
  }

  return { success: false, error: 'Akses ditolak: Anda tidak memiliki izin untuk menghapus transaksi ini.' };
}
