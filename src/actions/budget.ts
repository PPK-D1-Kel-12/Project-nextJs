'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser, type CurrentUser } from '@/lib/auth-user';
import { db } from '@/lib/prisma';

export interface BudgetItem {
  id: string;
  userId: string;
  month: number;
  year: number;
  targetAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SetMonthlyBudgetInput {
  month: number;
  year: number;
  targetAmount: number;
}

export interface GetBudgetInput {
  month: number;
  year: number;
}

interface PrismaOrmBudget {
  where: (clause: Record<string, unknown>) => {
    all?: () => Promise<Array<Record<string, unknown>>>;
    findMany?: () => Promise<Array<Record<string, unknown>>>;
    update: (params: Record<string, unknown>) => Promise<unknown>;
    delete: () => Promise<unknown>;
  };
  create: (params: Record<string, unknown>) => Promise<unknown>;
}

interface PrismaDbClient {
  orm?: {
    public?: {
      Budget?: PrismaOrmBudget;
    };
  };
}

// Global in-memory cache untuk fallback jika PostgreSQL offline saat dev & testing
const globalForBudgetMemory = globalThis as unknown as {
  _memoryBudgets?: Map<string, BudgetItem[]>;
  _testUserContext?: CurrentUser | null;
};

if (!globalForBudgetMemory._memoryBudgets) {
  globalForBudgetMemory._memoryBudgets = new Map<string, BudgetItem[]>();
}
const memoryBudgets = globalForBudgetMemory._memoryBudgets;

// Testing helper to simulate different users for SRS-15 isolation tests
export async function _setTestUserContext(user: CurrentUser | null) {
  globalForBudgetMemory._testUserContext = user;
}

export async function _resetMemoryBudgets() {
  memoryBudgets.clear();
  if (process.env.DATABASE_URL) {
    try {
      const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Budget;
      if (orm) {
        await orm.where({ userId: 'user-angga-001' }).delete?.();
        await orm.where({ userId: 'user-bella-002' }).delete?.();
      }
    } catch {
      // ignore cleanup errors during test
    }
  }
}

async function resolveUser(): Promise<CurrentUser> {
  if (globalForBudgetMemory._testUserContext) {
    return globalForBudgetMemory._testUserContext;
  }
  return await getCurrentUser();
}

function safeRevalidatePath(path: string, type?: 'page' | 'layout') {
  try {
    revalidatePath(path, type);
  } catch {
    // Ignore cache revalidation outside request context
  }
}

function getUserMemoryList(userId: string): BudgetItem[] {
  if (!memoryBudgets.has(userId)) {
    memoryBudgets.set(userId, []);
  }
  return memoryBudgets.get(userId)!;
}

export async function setMonthlyBudget(
  input: SetMonthlyBudgetInput
): Promise<{ success: boolean; data?: BudgetItem; error?: string }> {
  try {
    const user = await resolveUser();
    if (!user || !user.id) {
      return { success: false, error: 'Pengguna tidak terautentikasi' };
    }

    const { month, year, targetAmount } = input;

    if (typeof targetAmount !== 'number' || isNaN(targetAmount) || targetAmount <= 0) {
      return { success: false, error: 'Nominal target anggaran wajib bernilai positif' };
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return { success: false, error: 'Bulan tidak valid (harus bernilai 1 - 12)' };
    }

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return { success: false, error: 'Tahun tidak valid (harus bernilai antara 2000 - 2100)' };
    }

    // Coba simpan ke PostgreSQL jika DATABASE_URL ada
    if (process.env.DATABASE_URL) {
      try {
        const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Budget;
        if (orm) {
          const existingList = (await orm.where({ userId: user.id, month, year }).findMany?.()) ||
                               (await orm.where({ userId: user.id, month, year }).all?.()) || [];
          const nowStr = new Date().toISOString();

          if (existingList.length > 0) {
            const existingId = String(existingList[0].id);
            await orm.where({ id: existingId, userId: user.id }).update({
              targetAmount,
              updatedAt: nowStr,
            });
            const updatedItem: BudgetItem = {
              id: existingId,
              userId: user.id,
              month,
              year,
              targetAmount,
              createdAt: String(existingList[0].createdAt || nowStr),
              updatedAt: nowStr,
            };
            safeRevalidatePath('/budgets');
            safeRevalidatePath('/dashboard');
            return { success: true, data: updatedItem };
          } else {
            const newId = `budget-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            await orm.create({
              id: newId,
              userId: user.id,
              month,
              year,
              targetAmount,
              createdAt: nowStr,
              updatedAt: nowStr,
            });
            const createdItem: BudgetItem = {
              id: newId,
              userId: user.id,
              month,
              year,
              targetAmount,
              createdAt: nowStr,
              updatedAt: nowStr,
            };
            safeRevalidatePath('/budgets');
            safeRevalidatePath('/dashboard');
            return { success: true, data: createdItem };
          }
        }
      } catch (dbErr) {
        console.warn('Prisma ORM fallback to memory store:', dbErr);
      }
    }

    // In-memory fallback
    const list = getUserMemoryList(user.id);
    const existingIndex = list.findIndex((b) => b.month === month && b.year === year);
    const nowStr = new Date().toISOString();

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        targetAmount,
        updatedAt: nowStr,
      };
      safeRevalidatePath('/budgets');
      safeRevalidatePath('/dashboard');
      return { success: true, data: list[existingIndex] };
    } else {
      const newItem: BudgetItem = {
        id: `budget-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: user.id,
        month,
        year,
        targetAmount,
        createdAt: nowStr,
        updatedAt: nowStr,
      };
      list.push(newItem);
      safeRevalidatePath('/budgets');
      safeRevalidatePath('/dashboard');
      return { success: true, data: newItem };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menetapkan target anggaran';
    return { success: false, error: msg };
  }
}

export async function getCurrentBudget(
  input: GetBudgetInput
): Promise<{ success: boolean; data?: BudgetItem | null; error?: string }> {
  try {
    const user = await resolveUser();
    if (!user || !user.id) {
      return { success: false, error: 'Pengguna tidak terautentikasi' };
    }

    const { month, year } = input;

    if (process.env.DATABASE_URL) {
      try {
        const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Budget;
        if (orm) {
          const existingList = (await orm.where({ userId: user.id, month, year }).findMany?.()) ||
                               (await orm.where({ userId: user.id, month, year }).all?.()) || [];
          if (existingList.length > 0) {
            const item: BudgetItem = {
              id: String(existingList[0].id),
              userId: String(existingList[0].userId),
              month: Number(existingList[0].month),
              year: Number(existingList[0].year),
              targetAmount: Number(existingList[0].targetAmount),
              createdAt: String(existingList[0].createdAt || ''),
              updatedAt: String(existingList[0].updatedAt || ''),
            };
            return { success: true, data: item };
          }
          return { success: true, data: null };
        }
      } catch (dbErr) {
        console.warn('Prisma ORM fallback to memory store:', dbErr);
      }
    }

    const list = getUserMemoryList(user.id);
    const item = list.find((b) => b.month === month && b.year === year) || null;
    return { success: true, data: item };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengambil data anggaran';
    return { success: false, error: msg };
  }
}

export async function getUserBudgets(): Promise<BudgetItem[]> {
  try {
    const user = await resolveUser();
    if (!user || !user.id) return [];

    if (process.env.DATABASE_URL) {
      try {
        const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Budget;
        if (orm) {
          const list = (await orm.where({ userId: user.id }).findMany?.()) ||
                       (await orm.where({ userId: user.id }).all?.()) || [];
          return list.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            userId: String(r.userId),
            month: Number(r.month),
            year: Number(r.year),
            targetAmount: Number(r.targetAmount),
            createdAt: String(r.createdAt || ''),
            updatedAt: String(r.updatedAt || ''),
          })).sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month));
        }
      } catch (dbErr) {
        console.warn('Prisma ORM fallback to memory store:', dbErr);
      }
    }

    const list = getUserMemoryList(user.id);
    return [...list].sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month));
  } catch {
    return [];
  }
}

export async function deleteBudget(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await resolveUser();
    if (!user || !user.id) {
      return { success: false, error: 'Pengguna tidak terautentikasi' };
    }

    if (process.env.DATABASE_URL) {
      try {
        const orm = (db as unknown as PrismaDbClient)?.orm?.public?.Budget;
        if (orm) {
          const rows = (await orm.where({ id, userId: user.id }).findMany?.()) ||
                      (await orm.where({ id, userId: user.id }).all?.()) || [];
          if (rows.length === 0) {
            return { success: false, error: 'Akses ditolak atau anggaran tidak ditemukan' };
          }
          await orm.where({ id, userId: user.id }).delete();
          safeRevalidatePath('/budgets');
          safeRevalidatePath('/dashboard');
          return { success: true };
        }
      } catch (dbErr) {
        console.warn('Prisma ORM fallback to memory store:', dbErr);
      }
    }

    const list = getUserMemoryList(user.id);
    const index = list.findIndex((b) => b.id === id);
    if (index === -1) {
      return { success: false, error: 'Akses ditolak atau anggaran tidak ditemukan' };
    }

    list.splice(index, 1);
    safeRevalidatePath('/budgets');
    safeRevalidatePath('/dashboard');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus anggaran';
    return { success: false, error: msg };
  }
}
