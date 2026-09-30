# Harmonize Budget System (SRS-11 to SRS-15) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyatukan arsitektur modul budgeting (SRS-11 s/d SRS-15) dengan mensinkronkan kontrak skema Prisma 8 (`feat/budget-core`), menyelaraskan pemilih periode URL (`?month=YYYY-MM`), serta menghubungkan metrik pagu target bulanan dengan alokasi rekening & kategori.

**Architecture:** Menggabungkan perubahan database kontrak Prisma 8 dari commit `39b2b02` ke `main`, menyatukan antarmuka halaman `/budgets` di bawah satu navigasi periode berbasis URL query parameter yang tersinkronisasi, dan menghadirkan ringkasan komparatif antara pagu target bulanan utama (SRS-11/13/14) dan akumulasi alokasi pos rekening & kategori (SRS-12).

**Tech Stack:** Next.js 16 (Turbopack, App Router, Server Actions), React 19, TypeScript, Prisma 8, Supabase PostgreSQL, Tailwind CSS, Vitest.

**Spec:** `SRS.md` (SRS-11, SRS-12, SRS-13, SRS-14, SRS-15).

## Global Constraints

- Wajib mempertahankan kompatibilitas Next.js 16 server actions (`'use server'` hanya mengekspor fungsi `async`).
- Format periode URL standar: `?month=YYYY-MM` (rentang tahun 2000 s/d 9999, bulan 01 s/d 12).
- Seluruh query dan mutasi data anggaran wajib menerapkan isolasi multi-user mandiri (`userId` = pengguna yang terautentikasi, SRS-15).
- Pengujian regresi wajib lulus 100% pada `npm test` dan verifikasi rute pada `npm run build`.

---

### Task 1: Integrasi Kontrak Skema Prisma 8 & Sinkronisasi Commit `39b2b02`

**Files:**
- Modify: `src/actions/budget.ts`
- Modify: `src/actions/__tests__/budget-core.test.ts`
- Modify: `prisma/schema.d.ts`
- Modify: `prisma/schema.json`
- Modify: `migrations/app/contract.d.ts`
- Modify: `migrations/app/refs/db.json`
- Modify: `prisma.config.ts`

**Interfaces:**
- Consumes: Commit `origin/feat/budget-core` (`39b2b028a7a897bef554494d0cad23e65977d088`).
- Produces: Definisi tipe ORM `db.orm.public.Budget` pada Prisma 8 dan fungsi pembersihan `_resetMemoryBudgets()` yang membersihkan data uji di database live saat `DATABASE_URL` aktif.

- [ ] **Step 1: Jalankan pengujian eksisting untuk memastikan baseline bersih**

Run: `npx vitest run src/actions/__tests__/budget-core.test.ts`
Expected: PASS (6 tests passing).

- [ ] **Step 2: Lakukan cherry-pick atau merge commit 39b2b02 ke branch kerja main**

Run in terminal:
```powershell
git merge origin/feat/budget-core --no-edit -m "chore(db): merge prisma 8 budget contract sync from feat/budget-core"
```
Expected: Clean auto-merge completed without conflict.

- [ ] **Step 3: Verifikasi keberadaan definisi Budget di schema.d.ts**

Run in terminal:
```powershell
Select-String -Path "prisma/schema.d.ts" -Pattern "Budget"
```
Expected: Ditemukan definisi `readonly Budget: { readonly fields: ... }`.

- [ ] **Step 4: Jalankan rangkaian test unit & integrasi untuk verifikasi regresi**

Run: `npm test`
Expected: PASS seluruh test (minimal 41 tests passing).

- [ ] **Step 5: Verifikasi build Next.js**

Run: `npm run build`
Expected: Build berhasil tanpa error tipe data atau route generator.

---

### Task 2: Modul Kalkulasi Komparatif Pagu Utama vs Alokasi Kategori (SRS-11 & SRS-12)

**Files:**
- Modify: `src/lib/budgets.ts`
- Test: `src/actions/__tests__/budgets.test.ts`

**Interfaces:**
- Consumes: `BudgetData` (dari `src/lib/budgets.ts`), `targetBudget: number` (dari `src/actions/budget.ts`).
- Produces: `compareMonthlyBudgetWithAllocations(targetBudget: number, data: BudgetData)` yang menghasilkan perbandingan nominal dan persentase pagu yang telah dialokasikan ke rekening/kategori.

- [ ] **Step 1: Tulis unit test yang menguji fungsi komparasi anggaran**

Tambahkan pengujian berikut pada `src/actions/__tests__/budgets.test.ts`:
```typescript
import { compareMonthlyBudgetWithAllocations, type BudgetData } from '@/lib/budgets';

describe('compareMonthlyBudgetWithAllocations (SRS-11 & SRS-12)', () => {
  it('harus menghitung sisa pagu yang belum dialokasikan dan status alokasi', () => {
    const mockData: BudgetData = {
      accounts: [{ id: 'acc-1', name: 'BCA' }],
      categories: [{ id: 'cat-1', name: 'Makanan' }, { id: 'cat-2', name: 'Transport' }],
      allocations: [
        { id: 'al-1', account_id: 'acc-1', category_id: 'cat-1', month: '2026-09-01', amount: 2000000 },
        { id: 'al-2', account_id: 'acc-1', category_id: 'cat-2', month: '2026-09-01', amount: 1000000 },
      ],
    };

    const result = compareMonthlyBudgetWithAllocations(5000000, mockData);
    expect(result.targetBudget).toBe(5000000);
    expect(result.totalAllocated).toBe(3000000);
    expect(result.unallocatedAmount).toBe(2000000);
    expect(result.allocationPercentage).toBe(60);
    expect(result.status).toBe('UNDER_ALLOCATED');
  });

  it('harus menandai OVER_ALLOCATED jika total alokasi melebihi pagu target', () => {
    const mockData: BudgetData = {
      accounts: [{ id: 'acc-1', name: 'BCA' }],
      categories: [{ id: 'cat-1', name: 'Sewa' }],
      allocations: [
        { id: 'al-1', account_id: 'acc-1', category_id: 'cat-1', month: '2026-09-01', amount: 6000000 },
      ],
    };

    const result = compareMonthlyBudgetWithAllocations(5000000, mockData);
    expect(result.totalAllocated).toBe(6000000);
    expect(result.unallocatedAmount).toBe(-1000000);
    expect(result.allocationPercentage).toBe(120);
    expect(result.status).toBe('OVER_ALLOCATED');
  });
});
```

- [ ] **Step 2: Jalankan test untuk memverifikasi kegagalan (Red)**

Run: `npx vitest run src/actions/__tests__/budgets.test.ts`
Expected: FAIL dengan pesan `compareMonthlyBudgetWithAllocations is not defined`.

- [ ] **Step 3: Implementasikan fungsi pada `src/lib/budgets.ts` (Green)**

Tambahkan kode pada `src/lib/budgets.ts`:
```typescript
export interface BudgetComparison {
  targetBudget: number;
  totalAllocated: number;
  unallocatedAmount: number;
  allocationPercentage: number;
  status: 'UNDER_ALLOCATED' | 'BALANCED' | 'OVER_ALLOCATED' | 'NO_TARGET';
}

export function compareMonthlyBudgetWithAllocations(
  targetBudget: number,
  data: BudgetData
): BudgetComparison {
  const totalAllocated = data.allocations.reduce((sum, item) => sum + item.amount, 0);

  if (targetBudget <= 0) {
    return {
      targetBudget: 0,
      totalAllocated,
      unallocatedAmount: -totalAllocated,
      allocationPercentage: totalAllocated > 0 ? 100 : 0,
      status: 'NO_TARGET',
    };
  }

  const unallocatedAmount = targetBudget - totalAllocated;
  const allocationPercentage = Math.round((totalAllocated / targetBudget) * 100);

  let status: BudgetComparison['status'] = 'UNDER_ALLOCATED';
  if (totalAllocated === targetBudget) {
    status = 'BALANCED';
  } else if (totalAllocated > targetBudget) {
    status = 'OVER_ALLOCATED';
  }

  return {
    targetBudget,
    totalAllocated,
    unallocatedAmount,
    allocationPercentage,
    status,
  };
}
```

- [ ] **Step 4: Jalankan test untuk memastikan sukses (Green)**

Run: `npx vitest run src/actions/__tests__/budgets.test.ts`
Expected: PASS seluruh 10 tests pada file tersebut.

- [ ] **Step 5: Commit perubahan Task 2**

```bash
git add src/lib/budgets.ts src/actions/__tests__/budgets.test.ts
git commit -m "feat(budget): add comparative budget calculation between target and allocations"
```

---

### Task 3: Harmonisasi Pengendali Periode URL di Halaman `/budgets`

**Files:**
- Modify: `src/app/budgets/page.tsx`
- Modify: `src/app/budgets/budget-client.tsx`
- Modify: `src/app/budgets/workspace.tsx`

**Interfaces:**
- Consumes: URL query param `?month=YYYY-MM`, `getUserBudgets()`, `getBudgetData(month)`.
- Produces: Komponen navigasi bulan tunggal di bagian paling atas halaman yang mengontrol konteks periode untuk `<BudgetClient />` dan `<BudgetWorkspace />` secara sinkron.

- [ ] **Step 1: Modifikasi `BudgetClient` untuk menerima `selectedMonth` dan `selectedYear` langsung dari URL**

Sesuaikan `src/app/budgets/budget-client.tsx` agar ketika pengguna mengganti bulan di dropdown/tombol periode, komponen memanggil router navigasi URL (`router.push('/budgets?month=' + formattedMonth)`), sehingga seluruh halaman berpindah bulan secara tersinkronisasi.

- [ ] **Step 2: Tampilkan Indikator Alokasi Bersama Ringkasan Pagu**

Di dalam `BudgetClient` atau ringkasan atas halaman `/budgets`, gunakan `compareMonthlyBudgetWithAllocations` untuk menampilkan badge/progress bar alokasi kategori terhadap pagu target (misal: "Dialokasikan Rp 3.000.000 dari Target Rp 5.000.000 (60%)").

- [ ] **Step 3: Rapikan tata letak `src/app/budgets/page.tsx`**

Hapus form filter bulan ganda yang membingungkan, jadikan pemilih bulan tunggal di bagian atas header halaman `/budgets` yang mengalirkan state `month` ke seluruh widget di bawahnya.

- [ ] **Step 4: Jalankan seluruh test unit & integrasi**

Run: `npm test`
Expected: PASS 100%.

- [ ] **Step 5: Verifikasi build produksi**

Run: `npm run build`
Expected: Compiled successfully dengan status exit code 0.

- [ ] **Step 6: Commit perubahan Task 3**

```bash
git add src/app/budgets/page.tsx src/app/budgets/budget-client.tsx src/app/budgets/workspace.tsx
git commit -m "feat(budgets): unify URL period selector and synchronize monthly budget with category allocations"
```

---

## Self-Review Checklist

1. **Spec Coverage:**
   - SRS-11 (Set Budget Bulanan): Tercakup di Task 1 & Task 3.
   - SRS-12 (Multi-Budget Rekening & Kategori): Tercakup di Task 2 & Task 3.
   - SRS-13 (Budget Summary): Tercakup di Task 2 & Task 3.
   - SRS-14 (Budget Indicator): Tercakup di Task 2 & Task 3.
   - SRS-15 (Hak Akses Mandiri Data): Terjamin di Task 1 (RLS & Prisma User Isolation).
2. **Placeholder Scan:** Tidak ada TODO/TBD, seluruh langkah memuat kode dan perintah konkrit.
3. **Type Consistency:** Menggunakan tipe data `BudgetData`, `BudgetItem`, `BudgetComparison`, `validMonth` secara konsisten.
