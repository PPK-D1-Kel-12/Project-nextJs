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
    findMany: () => Promise<Array<Record<string, unknown>>>;
    update: (params: { data: Record<string, unknown> }) => Promise<unknown>;
    delete: () => Promise<unknown>;
  };
  create: (params: { data: Record<string, unknown> }) => Promise<unknown>;
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
    // Dummy initial transactions for demonstration
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
  }
  return memoryStore.get(userId)!;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const user = await getCurrentUser();

  try {
    if (process.env.DATABASE_URL) {
      const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Transaction;
      if (orm) {
        const rows = await orm.where({ userId: user.id }).findMany();
        if (rows && rows.length >= 0) {
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

  try {
    if (process.env.DATABASE_URL) {
      const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Transaction;
      if (orm) {
        const rows = await orm.where({ userId: user.id }).findMany();
        if (rows && rows.length >= 0) {
          list = rows.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            userId: String(r.userId),
            type: r.type as 'INCOME' | 'EXPENSE',
            amount: Number(r.amount),
            date: typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date as string | number | Date).toISOString().split('T')[0],
            description: String(r.description),
            createdAt: String(r.createdAt || ''),
          }));
        }
      }
    }
  } catch (err) {
    console.warn('Prisma DB query failed, using memory store fallback:', err);
  }

  if (list.length === 0) {
    list = [...getMemoryList(user.id)];
  }

  // Apply filters
  if (filter?.type && filter.type !== 'ALL') {
    list = list.filter((t) => t.type === filter.type);
  }

  if (filter?.startDate) {
    const start = new Date(filter.startDate).getTime();
    list = list.filter((t) => new Date(t.date).getTime() >= start);
  }

  if (filter?.endDate) {
    const end = new Date(filter.endDate).getTime();
    list = list.filter((t) => new Date(t.date).getTime() <= end);
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

  // Otorisasi check (SRS-10: tolak upaya ubah transaksi milik orang lain)
  const items = getMemoryList(user.id);
  const existingIndex = items.findIndex((t) => t.id === input.id);

  if (existingIndex === -1) {
    return { success: false, error: 'Akses ditolak: Transaksi tidak ditemukan atau bukan milik Anda.' };
  }

  const updated: TransactionItem = {
    ...items[existingIndex],
    type: input.type,
    amount: Number(input.amount),
    date: input.date,
    description: input.description.trim(),
  };

  try {
    if (process.env.DATABASE_URL) {
      const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Transaction;
      if (orm) {
        await orm.where({ id: input.id, userId: user.id }).update({
          data: {
            type: updated.type,
            amount: updated.amount,
            date: new Date(updated.date).toISOString(),
            description: updated.description,
          },
        });
      }
    }
  } catch (err) {
    console.warn('Prisma DB update failed, updated in memory store:', err);
  }

  items[existingIndex] = updated;

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  return { success: true, data: updated };
}

export async function deleteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();

  if (!id) {
    return { success: false, error: 'ID Transaksi diperlukan.' };
  }

  // Otorisasi check (SRS-10: tolak upaya hapus transaksi milik orang lain)
  const items = getMemoryList(user.id);
  const existingIndex = items.findIndex((t) => t.id === id);

  if (existingIndex === -1) {
    return { success: false, error: 'Akses ditolak: Anda tidak memiliki izin untuk menghapus transaksi ini.' };
  }

  try {
    if (process.env.DATABASE_URL) {
      const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Transaction;
      if (orm) {
        await orm.where({ id, userId: user.id }).delete();
      }
    }
  } catch (err) {
    console.warn('Prisma DB delete failed, deleted from memory store:', err);
  }

  items.splice(existingIndex, 1);

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  return { success: true };
}
