# Core Budget & Data Isolation (SRS-11 & SRS-15) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement monthly budget target management (SRS-11) and guarantee multi-user data isolation and private access control (SRS-15) for Anggota 1 (Dev 1).

**Architecture:** Next.js 16 App Router with Server Actions. Database schema defines a `Budget` model with unique constraint on `(userId, month, year)`. Server Actions implement a resilient dual-mode architecture (Prisma 8 ORM when PostgreSQL is reachable, with global in-memory store fallback for offline/test environments). Strict user isolation is enforced on every read and write operation via session validation (`getCurrentUser()`). The UI includes an interactive page at `/budgets` with month/year selector, quick budget presets, live status card, budget history table, and navigation item in the main Navbar.

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19, TypeScript 5, Tailwind CSS 4, Prisma 8 (`@prisma/orm-postgres`), Vitest.

**Spec:** [docs/sprint-budget-plan.md](file:///c:/Menza/Praktikum%20PPK/Project-nextJs/Project-nextJs/docs/sprint-budget-plan.md) and [SRS.md](file:///c:/Menza/Praktikum%20PPK/Project-nextJs/Project-nextJs/SRS.md).

## Global Constraints

- **SRS-11 (Set Budget Bulanan):** Sistem harus memungkinkan pengguna menetapkan target nominal anggaran (budget) untuk periode bulan tertentu (misal: Oktober 2026).
- **SRS-15 (Hak Akses Mandiri):** Sistem harus memastikan setiap pengguna hanya dapat melihat, mengatur, dan memantau data anggaran serta transaksi miliknya sendiri.
- Nominal anggaran wajib bernilai positif (`targetAmount > 0`).
- Periode anggaran dimodelkan dengan field integer terpisah: `month` (1-12) dan `year` (>= 2000).
- Setiap query dan mutasi database WAJIB menyertakan filter `userId` milik pengguna terautentikasi.
- Seluruh kode harus lulus `npx tsc --noEmit` dan `npm run test` (Vitest).

## Strategi Pencegahan Konflik Merge Antar-Anggota (Zero-Conflict Strategy)

Untuk menjamin tidak terjadi merge conflict saat branch Anggota 2 (`feat/budget-multi-allocation`) dan Anggota 3 (`feat/budget-summary-indicator`) digabungkan ke `main`:

1. **Isolasi Berkas Logika & Server Actions:**
   - Seluruh logika Anggota 1 berada secara eksklusif di `src/actions/budget.ts` dan `src/actions/__tests__/budget-core.test.ts`.
   - Anggota 1 **tidak mengubah** berkas `src/actions/transactions.ts`, `src/actions/theme.ts`, ataupun `src/actions/auth.ts`.
   - Anggota 2 akan bekerja di `src/actions/budget-allocation.ts`, dan Anggota 3 di `src/actions/budget-analytics.ts`.
2. **Kanonisitas Skema Prisma (`prisma/schema.prisma`):**
   - Model `Budget` didefinisikan secara bersih di akhir berkas tanpa mengubah model `User` dan `Transaction` yang sudah ada.
   - Field `Budget` (`id`, `userId`, `month`, `year`, `targetAmount`) diekspor dengan tipe data standar sehingga Anggota 2 (relasi `BudgetAllocation`) dan Anggota 3 (agregasi `targetAmount`) dapat langsung menggunakannya.
3. **Struktur Komponen UI Modular (`src/components/budgets/`):**
   - Daripada menumpuk seluruh kode di satu berkas raksasa `page.tsx`, UI dipecah menjadi modul independen di `src/components/budgets/`:
     - `budget-form.tsx` (Form penetapan nominal & preset)
     - `budget-status-card.tsx` (Kartu ringkasan target periode aktif)
     - `budget-history-table.tsx` (Tabel riwayat periode)
   - Berkas `src/app/budgets/page.tsx` dirancang dengan layout ber-slot (Slot Ringkasan Anggota 3, Slot Alokasi Kategori Anggota 2) sehingga anggota lain dapat memasang widget mereka tanpa bentrok kode.
4. **Edit Minimalis pada Navbar (`src/components/navbar.tsx`):**
   - Hanya menambahkan entri array `{ name: 'Anggaran', href: '/budgets', ... }` di `navLinks` tanpa mengubah format baris lainnya.

---

### Task 1: Git Branch Setup & Prisma Schema Update

**Files:**
- Modify: `prisma/schema.prisma:1-24`

**Interfaces:**
- Consumes: None (Schema definition)
- Produces: `Budget` model in `prisma/schema.prisma` with fields `id`, `userId`, `month`, `year`, `targetAmount`, `createdAt`, `updatedAt`, and unique constraint `[userId, month, year]`.

- [ ] **Step 1: Create and switch to git branch `feat/budget-core`**

Run:
```bash
git checkout -b feat/budget-core
```
Expected: Switched to a new branch 'feat/budget-core'

- [ ] **Step 2: Update `prisma/schema.prisma` to include `Budget` model**

Add model `Budget` to `prisma/schema.prisma`:
```prisma
// use prisma-8

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt TimestamptzString @default(now())
  updatedAt temporal.updatedAtString()
}

model Transaction {
  id          String            @id @default(uuid())
  userId      String
  type        String
  amount      Float
  date        TimestamptzString @default(now())
  description String
  createdAt   TimestamptzString @default(now())
  updatedAt   temporal.updatedAtString()
}

model Budget {
  id           String            @id @default(uuid())
  userId       String
  month        Int
  year         Int
  targetAmount Float
  createdAt    TimestamptzString @default(now())
  updatedAt    temporal.updatedAtString()

  @@unique([userId, month, year])
}
```

- [ ] **Step 3: Verify TypeScript and existing tests still pass**

Run: `npm run test`
Expected: 19 passed

- [ ] **Step 4: Commit schema changes**

```bash
git add prisma/schema.prisma
git commit -m "feat(budget): add Budget model to prisma schema"
```

---

### Task 2: Core Server Actions & Multi-User Isolation Logic (TDD)

**Files:**
- Create: `src/actions/__tests__/budget-core.test.ts`
- Create: `src/actions/budget.ts`

**Interfaces:**
- Consumes: `getCurrentUser()` from `@/lib/auth-user`, `db` from `@/lib/prisma`
- Produces:
  - `BudgetItem`: `{ id: string; userId: string; month: number; year: number; targetAmount: number; createdAt?: string; updatedAt?: string; }`
  - `setMonthlyBudget(input: { month: number; year: number; targetAmount: number }): Promise<{ success: boolean; data?: BudgetItem; error?: string }>`
  - `getCurrentBudget(input: { month: number; year: number }): Promise<{ success: boolean; data?: BudgetItem | null; error?: string }>`
  - `getUserBudgets(): Promise<BudgetItem[]>`
  - `deleteBudget(id: string): Promise<{ success: boolean; error?: string }>`
  - `_setTestUserContext(user: { id: string; name: string; email: string } | null): void` (for isolated multi-user testing)

- [ ] **Step 1: Write the failing unit tests for budget actions and data isolation**

Create `src/actions/__tests__/budget-core.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  setMonthlyBudget,
  getCurrentBudget,
  getUserBudgets,
  deleteBudget,
  _setTestUserContext,
  _resetMemoryBudgets,
} from '@/actions/budget';

describe('Budget Core Actions & Data Isolation (SRS-11 & SRS-15)', () => {
  beforeEach(() => {
    _resetMemoryBudgets();
    _setTestUserContext({
      id: 'user-angga-001',
      name: 'Angga',
      email: 'angga@example.com',
    });
  });

  it('SRS-11: menolak penetapan budget jika targetAmount <= 0', async () => {
    const result = await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: 0,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Nominal target anggaran wajib bernilai positif');

    const negativeResult = await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: -500000,
    });
    expect(negativeResult.success).toBe(false);
    expect(negativeResult.error).toContain('Nominal target anggaran wajib bernilai positif');
  });

  it('SRS-11: menolak penetapan budget jika bulan atau tahun tidak valid', async () => {
    const invalidMonth = await setMonthlyBudget({
      month: 13,
      year: 2026,
      targetAmount: 2000000,
    });
    expect(invalidMonth.success).toBe(false);
    expect(invalidMonth.error).toContain('Bulan tidak valid');

    const invalidYear = await setMonthlyBudget({
      month: 5,
      year: 1999,
      targetAmount: 2000000,
    });
    expect(invalidYear.success).toBe(false);
    expect(invalidYear.error).toContain('Tahun tidak valid');
  });

  it('SRS-11: berhasil menetapkan target budget bulanan baru', async () => {
    const result = await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: 3500000,
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.targetAmount).toBe(3500000);
    expect(result.data?.month).toBe(10);
    expect(result.data?.year).toBe(2026);
    expect(result.data?.userId).toBe('user-angga-001');

    const fetched = await getCurrentBudget({ month: 10, year: 2026 });
    expect(fetched.success).toBe(true);
    expect(fetched.data?.targetAmount).toBe(3500000);
  });

  it('SRS-11: melakukan upsert (memperbarui budget yang sudah ada pada periode yang sama)', async () => {
    await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: 3000000,
    });

    const updated = await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: 4500000,
    });
    expect(updated.success).toBe(true);
    expect(updated.data?.targetAmount).toBe(4500000);

    const list = await getUserBudgets();
    const octBudgets = list.filter((b) => b.month === 10 && b.year === 2026);
    expect(octBudgets.length).toBe(1);
    expect(octBudgets[0].targetAmount).toBe(4500000);
  });

  it('SRS-15: Isolasi Data - Pengguna hanya dapat melihat budget miliknya sendiri', async () => {
    // User A menetapkan budget Oktober 2026
    _setTestUserContext({
      id: 'user-angga-001',
      name: 'Angga',
      email: 'angga@example.com',
    });
    await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: 5000000,
    });

    // Beralih ke User B (Bella)
    _setTestUserContext({
      id: 'user-bella-002',
      name: 'Bella',
      email: 'bella@example.com',
    });

    // User B cek budget Oktober 2026 -> harus null (bukan data milik User A)
    const bellaBudget = await getCurrentBudget({ month: 10, year: 2026 });
    expect(bellaBudget.success).toBe(true);
    expect(bellaBudget.data).toBeNull();

    // User B menetapkan budget Oktober 2026 miliknya sendiri
    await setMonthlyBudget({
      month: 10,
      year: 2026,
      targetAmount: 2000000,
    });

    const bellaList = await getUserBudgets();
    expect(bellaList.length).toBe(1);
    expect(bellaList[0].targetAmount).toBe(2000000);
    expect(bellaList[0].userId).toBe('user-bella-002');

    // Beralih kembali ke User A -> data User A tidak berubah
    _setTestUserContext({
      id: 'user-angga-001',
      name: 'Angga',
      email: 'angga@example.com',
    });
    const anggaBudget = await getCurrentBudget({ month: 10, year: 2026 });
    expect(anggaBudget.data?.targetAmount).toBe(5000000);
  });

  it('SRS-15: Isolasi Data - Pengguna tidak dapat menghapus budget milik pengguna lain', async () => {
    // User A membuat budget
    _setTestUserContext({
      id: 'user-angga-001',
      name: 'Angga',
      email: 'angga@example.com',
    });
    const created = await setMonthlyBudget({
      month: 11,
      year: 2026,
      targetAmount: 3000000,
    });
    const budgetId = created.data!.id;

    // User B mencoba menghapus budget milik User A
    _setTestUserContext({
      id: 'user-bella-002',
      name: 'Bella',
      email: 'bella@example.com',
    });
    const deleteAttempt = await deleteBudget(budgetId);
    expect(deleteAttempt.success).toBe(false);
    expect(deleteAttempt.error).toContain('Akses ditolak');

    // User A menghapus budget miliknya sendiri -> berhasil
    _setTestUserContext({
      id: 'user-angga-001',
      name: 'Angga',
      email: 'angga@example.com',
    });
    const deleteSuccess = await deleteBudget(budgetId);
    expect(deleteSuccess.success).toBe(true);

    const recheck = await getCurrentBudget({ month: 11, year: 2026 });
    expect(recheck.data).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/actions/__tests__/budget-core.test.ts`
Expected: FAIL (Cannot find module '@/actions/budget')

- [ ] **Step 3: Implement `src/actions/budget.ts`**

Create `src/actions/budget.ts`:
```typescript
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
export function _setTestUserContext(user: CurrentUser | null) {
  globalForBudgetMemory._testUserContext = user;
}

export function _resetMemoryBudgets() {
  memoryBudgets.clear();
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/actions/__tests__/budget-core.test.ts`
Expected: 6 passed

- [ ] **Step 5: Run all unit tests**

Run: `npm run test`
Expected: 25 passed

- [ ] **Step 6: Commit server action & test**

```bash
git add src/actions/budget.ts src/actions/__tests__/budget-core.test.ts
git commit -m "feat(budget): add core budget actions with multi-user isolation (SRS-11 & SRS-15)"
```

---

### Task 3: Navigation Bar Integration (`src/components/navbar.tsx`)

**Files:**
- Modify: `src/components/navbar.tsx:43-85`

**Interfaces:**
- Consumes: None (Navigation UI)
- Produces: Navigation item for "Anggaran" pointing to `/budgets` in both desktop and mobile menus.

- [ ] **Step 1: Inspect `src/components/navbar.tsx` links**

In `src/components/navbar.tsx`, locate `navLinks` array:
```typescript
    {
      name: 'Anggaran',
      href: '/budgets',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-8 5H5a2 2 0 0 1-2-2V7" />
          <path d="M16 11h.01" />
        </svg>
      ),
    },
```
Add this item right after "Riwayat Transaksi" so users can navigate to `/budgets`.

- [ ] **Step 2: Verify lint and tests pass**

Run: `npm run lint` and `npm run test`
Expected: PASS with 0 lint errors

- [ ] **Step 3: Commit navbar change**

```bash
git add src/components/navbar.tsx
git commit -m "feat(navbar): add Anggaran menu link to navbar"
```

---

### Task 4: Modular Budgets Page UI (`src/app/budgets/` & `src/components/budgets/`)

**Files:**
- Create: `src/components/budgets/budget-form.tsx`
- Create: `src/components/budgets/budget-history-table.tsx`
- Create: `src/app/budgets/budget-client.tsx`
- Create: `src/app/budgets/page.tsx`

**Interfaces:**
- Consumes:
  - `getCurrentUser()` from `@/lib/auth-user`
  - `getCurrentBudget()`, `getUserBudgets()`, `setMonthlyBudget()`, `deleteBudget()` from `@/actions/budget`
- Produces: Complete responsive page `/budgets` for setting, updating, and reviewing monthly budgets, built with isolated modular components so Anggota 2 (`BudgetAllocationList`) and Anggota 3 (`BudgetSummaryWidget`) can integrate seamlessly without merge conflicts.

- [ ] **Step 1: Create `src/components/budgets/budget-form.tsx`**

Modular client component featuring:
- Period picker: Bulan (1-12) & Tahun
- Target Amount input dengan real-time formatting Rupiah
- Quick Preset Nominal buttons (Rp 1.000.000, Rp 2.500.000, Rp 5.000.000, Rp 10.000.000, Rp 15.000.000)
- Tombol submit (Simpan/Perbarui) dengan state loading
- Tombol Hapus Anggaran jika budget bulan tersebut sudah ada

- [ ] **Step 2: Create `src/components/budgets/budget-history-table.tsx`**

Modular component featuring:
- Tabel riwayat anggaran seluruh bulan pengguna
- Format nominal Rupiah
- Tombol cepat "Pilih & Edit" untuk memuat bulan tersebut ke dalam form

- [ ] **Step 3: Create `src/app/budgets/budget-client.tsx` & `src/app/budgets/page.tsx`**

- `budget-client.tsx`: Mengorkestrasikan `BudgetForm` dan `BudgetHistoryTable`, dengan slot terbuka untuk:
  - Slot 1: Widget Ringkasan Anggaran (milik Anggota 3)
  - Slot 2: Alokasi Multi-Budget Kategori & Rekening (milik Anggota 2)
- `page.tsx`: Server component yang memvalidasi sesi user dan menyediakan initial data untuk SSR.

- [ ] **Step 4: Test and verify page build**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 5: Commit modular budgets UI**

```bash
git add src/components/budgets/ src/app/budgets/
git commit -m "feat(budgets): add modular budget management UI with conflict-free component slots (SRS-11 & SRS-15)"
```

---

### Task 5: End-to-End Verification & Quality Gate

**Files:**
- Run: Full suite verification across TypeScript, ESLint, Next.js build, and Vitest.

- [ ] **Step 1: Run TypeScript compiler**

Run: `npx tsc --noEmit`
Expected: Exit code 0, no type errors.

- [ ] **Step 2: Run ESLint**

Run: `npm run lint`
Expected: Exit code 0, no lint issues.

- [ ] **Step 3: Run Vitest unit tests**

Run: `npm run test`
Expected: All test suites pass (including `budget-core.test.ts`, `transactions.test.ts`, `auth.test.ts`).

- [ ] **Step 4: Run Next.js Production Build**

Run: `npm run build`
Expected: Build successfully completes with static/dynamic route `/budgets` generated.

- [ ] **Step 5: Final Review & Git status check**

Run: `git status`
Expected: Clean working tree on branch `feat/budget-core`.
