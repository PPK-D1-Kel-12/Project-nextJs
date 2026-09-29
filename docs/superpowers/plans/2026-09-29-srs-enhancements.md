# SRS Enhancements & Quality Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Konsolidasi struktur server actions ke `src/actions/`, penambahan indikator saldo defisit pada dashboard (SRS-05), implementasi client-side pagination pada riwayat transaksi (SRS-08), serta pembuatan automated testing suite berbasis Vitest untuk memvalidasi seluruh aturan bisnis SRS-01 s/d SRS-10.

**Architecture:** Memanfaatkan Vitest untuk pengujian terisolasi unit logic Server Actions dan verifikasi otorisasi multi-user tanpa ketergantungan mock external yang rumit. Menyelaraskan lokasi module actions di `src/actions/` dan menyempurnakan interaktivitas komponen Client (`DashboardClient` dan `TransactionsPage`) dengan kontrol paginasi dan umpan balik visual saldo defisit.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Prisma 8, Supabase SSR, Vitest 3.

**Spec:** [SRS.md](file:///C:/Menza/Praktikum%20PPK/Project-nextJs/Project-nextJs/SRS.md)

## Global Constraints

- Wajib mempertahankan kepatuhan penuh terhadap 10 kebutuhan fungsional di `SRS.md`.
- Semua tipe TypeScript harus lulus pemeriksaan ketat `npx tsc --noEmit` tanpa error.
- Linter `npm run lint` harus selalu berstatus 0 warning dan 0 error.
- Build Next.js `npm run build` harus selalu berhasil mengompilasi seluruh rute.
- Kode pengujian tidak boleh mengganggu runtime produksi (hanya berjalan di lingkungan pengujian `vitest`).

---

### Task 1: Setup Vitest & Test Runner Scaffolding

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/__tests__/smoke.test.ts`

**Interfaces:**
- Consumes: Node.js & TypeScript toolchain
- Produces: `npm test` script executing Vitest test runner with `@/*` path alias resolution.

- [ ] **Step 1: Pasang Vitest ke devDependencies**

Jalankan perintah instalasi Vitest:
```bash
npm install -D vitest@^3.0.7
```

- [ ] **Step 2: Konfigurasi `vitest.config.ts`**

Buat file `vitest.config.ts` di root direktori proyek:
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 3: Tambahkan script `test` di `package.json`**

Tambahkan baris berikut ke blok `"scripts"` di `package.json`:
```json
"test": "vitest run"
```

- [ ] **Step 4: Buat smoke test untuk memverifikasi runner**

Buat file `src/__tests__/smoke.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('Test Environment Scaffolding', () => {
  it('should execute tests and resolve arithmetic assertions', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Jalankan test runner**

Jalankan: `npm test`
Ekspektasi: 1 test file passed.

- [ ] **Step 6: Commit perubahan**

```bash
git add package.json package-lock.json vitest.config.ts src/__tests__/smoke.test.ts
git commit -m "chore: setup vitest testing framework and alias resolution"
```

---

### Task 2: Konsolidasi Server Actions ke `src/actions/` & Validasi Auth (SRS-01, SRS-02)

**Files:**
- Create: `src/actions/auth.ts` (dipindahkan dari `src/app/actions/auth.ts`)
- Delete: `src/app/actions/auth.ts`
- Modify: `src/components/auth/login-form.tsx`
- Modify: `src/components/auth/register-form.tsx`
- Modify: `src/components/auth/logout-button.tsx`
- Create: `src/actions/__tests__/auth.test.ts`

**Interfaces:**
- Consumes: `registerAction`, `loginAction`, `logoutAction`
- Produces: Seluruh server actions tersentralisasi di `src/actions/` dengan pengujian unit untuk validasi form auth.

- [ ] **Step 1: Pindahkan `auth.ts` ke `src/actions/auth.ts`**

Pindahkan konten file dari `src/app/actions/auth.ts` ke `src/actions/auth.ts` dan hapus file lama di `src/app/actions/auth.ts`.

- [ ] **Step 2: Update import path di komponen auth**

Di `src/components/auth/login-form.tsx`:
```typescript
// Ganti:
import { loginAction, type AuthActionState } from '@/app/actions/auth';
// Menjadi:
import { loginAction, type AuthActionState } from '@/actions/auth';
```

Di `src/components/auth/register-form.tsx`:
```typescript
// Ganti:
import { registerAction, type AuthActionState } from '@/app/actions/auth';
// Menjadi:
import { registerAction, type AuthActionState } from '@/actions/auth';
```

Di `src/components/auth/logout-button.tsx`:
```typescript
// Ganti:
import { logoutAction } from '@/app/actions/auth';
// Menjadi:
import { logoutAction } from '@/actions/auth';
```

- [ ] **Step 3: Tulis unit test untuk validasi form Auth (SRS-01, SRS-02)**

Buat file `src/actions/__tests__/auth.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { registerAction, loginAction } from '@/actions/auth';

describe('Auth Form Validations (SRS-01 & SRS-02)', () => {
  it('SRS-01: menolak registrasi jika kolom tidak lengkap', async () => {
    const formData = new FormData();
    formData.set('name', 'Bram');
    formData.set('email', '');
    formData.set('password', '123456');
    formData.set('confirmPassword', '123456');

    const result = await registerAction({}, formData);
    expect(result.error).toBe('Semua kolom wajib diisi.');
  });

  it('SRS-01: menolak registrasi dengan format email tidak valid', async () => {
    const formData = new FormData();
    formData.set('name', 'Bram');
    formData.set('email', 'bram-invalid-email');
    formData.set('password', '123456');
    formData.set('confirmPassword', '123456');

    const result = await registerAction({}, formData);
    expect(result.error).toBe('Format email tidak valid.');
  });

  it('SRS-01: menolak registrasi jika password kurang dari 6 karakter', async () => {
    const formData = new FormData();
    formData.set('name', 'Bram');
    formData.set('email', 'bram@example.com');
    formData.set('password', '12345');
    formData.set('confirmPassword', '12345');

    const result = await registerAction({}, formData);
    expect(result.error).toBe('Password minimal harus 6 karakter.');
  });

  it('SRS-01: menolak registrasi jika konfirmasi password tidak cocok', async () => {
    const formData = new FormData();
    formData.set('name', 'Bram');
    formData.set('email', 'bram@example.com');
    formData.set('password', 'password123');
    formData.set('confirmPassword', 'password999');

    const result = await registerAction({}, formData);
    expect(result.error).toBe('Konfirmasi password tidak cocok.');
  });

  it('SRS-02: menolak login jika email atau password kosong', async () => {
    const formData = new FormData();
    formData.set('email', '');
    formData.set('password', '');

    const result = await loginAction({}, formData);
    expect(result.error).toBe('Email dan password wajib diisi.');
  });
});
```

- [ ] **Step 4: Jalankan pengujian & linter**

Jalankan: `npm test && npm run lint`
Ekspektasi: Seluruh pengujian lolos, linter 0 error.

- [ ] **Step 5: Commit perubahan**

```bash
git add src/actions/auth.ts src/components/auth/ src/actions/__tests__/auth.test.ts
git rm src/app/actions/auth.ts
git commit -m "refactor: consolidate server actions into src/actions and add auth validation tests"
```

---

### Task 3: Unit Tests Transaksi & Otorisasi Hak Akses (SRS-05, SRS-07, SRS-08, SRS-09, SRS-10)

**Files:**
- Create: `src/actions/__tests__/transactions.test.ts`
- Modify: `src/actions/transactions.ts` (jika diperlukan penyempurnaan tipe/helper)

**Interfaces:**
- Consumes: `createTransaction`, `updateTransaction`, `deleteTransaction`, `getTransactions`, `getDashboardSummary`
- Produces: Test coverage penuh untuk validasi input, kalkulasi saldo, filtering, dan penolakan manipulasi transaksi milik orang lain.

- [ ] **Step 1: Buat test suite pengujian transaksi**

Buat file `src/actions/__tests__/transactions.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactions,
  getDashboardSummary,
} from '@/actions/transactions';

describe('Transaction Actions & Security Rules (SRS-05, 07, 08, 09, 10)', () => {
  beforeEach(async () => {
    // Reset/setup context bila diperlukan
  });

  it('SRS-07: menolak transaksi jika nominal <= 0', async () => {
    const result = await createTransaction({
      type: 'EXPENSE',
      amount: 0,
      date: '2026-09-29',
      description: 'Test Invalid Amount',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Nominal transaksi wajib bernilai positif');
  });

  it('SRS-07: menolak transaksi jika keterangan kosong', async () => {
    const result = await createTransaction({
      type: 'INCOME',
      amount: 50000,
      date: '2026-09-29',
      description: '   ',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Keterangan transaksi wajib diisi');
  });

  it('SRS-07 & SRS-05: berhasil mencatat transaksi dan memperbarui ringkasan dashboard', async () => {
    const created = await createTransaction({
      type: 'INCOME',
      amount: 1000000,
      date: '2026-09-29',
      description: 'Bonus Proyek',
    });
    expect(created.success).toBe(true);
    expect(created.data?.id).toBeDefined();

    const summary = await getDashboardSummary();
    expect(summary.totalIncome).toBeGreaterThanOrEqual(1000000);
    expect(summary.balance).toBe(summary.totalIncome - summary.totalExpense);
  });

  it('SRS-08: menyaring riwayat transaksi berdasarkan jenis (INCOME / EXPENSE)', async () => {
    const incomeList = await getTransactions({ type: 'INCOME' });
    for (const item of incomeList) {
      expect(item.type).toBe('INCOME');
    }

    const expenseList = await getTransactions({ type: 'EXPENSE' });
    for (const item of expenseList) {
      expect(item.type).toBe('EXPENSE');
    }
  });

  it('SRS-08: menyaring riwayat transaksi berdasarkan rentang tanggal', async () => {
    const filtered = await getTransactions({
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    });
    for (const item of filtered) {
      const datePart = item.date.split('T')[0];
      expect(datePart >= '2026-09-01').toBe(true);
      expect(datePart <= '2026-09-30').toBe(true);
    }
  });

  it('SRS-09: berhasil memperbarui data transaksi milik pengguna', async () => {
    const created = await createTransaction({
      type: 'EXPENSE',
      amount: 200000,
      date: '2026-09-29',
      description: 'Makan Siang',
    });
    expect(created.success).toBe(true);
    const id = created.data!.id;

    const updated = await updateTransaction({
      id,
      type: 'EXPENSE',
      amount: 250000,
      date: '2026-09-29',
      description: 'Makan Siang & Kopi',
    });
    expect(updated.success).toBe(true);
    expect(updated.data?.amount).toBe(250000);
    expect(updated.data?.description).toBe('Makan Siang & Kopi');
  });

  it('SRS-10: menolak perubahan transaksi jika ID tidak ditemukan atau milik user lain', async () => {
    const result = await updateTransaction({
      id: 'tx-non-existent-user-id',
      type: 'INCOME',
      amount: 50000,
      date: '2026-09-29',
      description: 'Illegal edit attempt',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Akses ditolak');
  });

  it('SRS-10: menolak penghapusan transaksi jika ID tidak ditemukan atau milik user lain', async () => {
    const result = await deleteTransaction('tx-non-existent-user-id');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Akses ditolak');
  });
});
```

- [ ] **Step 2: Jalankan test suite**

Jalankan: `npm test`
Ekspektasi: Semua pengujian pada `transactions.test.ts` dan `auth.test.ts` berhasil (passed).

- [ ] **Step 3: Commit perubahan**

```bash
git add src/actions/__tests__/transactions.test.ts
git commit -m "test: add comprehensive SRS test coverage for transactions and authorization"
```

---

### Task 4: Indikator Visual Saldo Defisit di Dashboard (SRS-05)

**Files:**
- Modify: `src/app/dashboard/dashboard-client.tsx:50-75`

**Interfaces:**
- Consumes: `DashboardSummary` (`balance`, `totalIncome`, `totalExpense`)
- Produces: Tampilan visual responsif pada Card Saldo Bersih yang memberikan peringatan kontras saat saldo negatif.

- [ ] **Step 1: Perbarui Card Saldo Bersih di `dashboard-client.tsx`**

Tambahkan pengecekan status defisit (`isDeficit = summary.balance < 0`):
```tsx
{/* Card 1: Saldo Bersih */}
{(() => {
  const isDeficit = summary.balance < 0;
  return (
    <div
      className={`p-6 rounded-2xl border shadow-xs relative overflow-hidden transition-all ${
        isDeficit
          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
          : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Saldo Bersih
        </span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isDeficit
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          {isDeficit ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          )}
        </div>
      </div>
      <div className="mt-3">
        <div
          className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono ${
            isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
          }`}
        >
          {formatRupiah(summary.balance)}
        </div>
        <p className="text-xs mt-1">
          {isDeficit ? (
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              Peringatan: Pengeluaran melebihi pemasukan (Defisit)
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              Selisih total pemasukan dikurangi pengeluaran
            </span>
          )}
        </p>
      </div>
    </div>
  );
})()}
```

- [ ] **Step 2: Uji kompilasi & tampilan**

Jalankan: `npx tsc --noEmit && npm run lint`
Ekspektasi: 0 error.

- [ ] **Step 3: Commit perubahan**

```bash
git add src/app/dashboard/dashboard-client.tsx
git commit -m "feat(dashboard): add visual deficit indicator for negative balance"
```

---

### Task 5: Client-Side Pagination pada Riwayat Transaksi (SRS-08)

**Files:**
- Modify: `src/app/transactions/page.tsx`

**Interfaces:**
- Consumes: Array `transactions` (hasil query/filter)
- Produces: Tampilan riwayat terpaginasi (10 baris per halaman) dengan kontrol navigasi Prev / Next dan penomoran halaman yang tersinkronisasi.

- [ ] **Step 1: Tambahkan state pagination di `transactions/page.tsx`**

```tsx
const [currentPage, setCurrentPage] = useState<number>(1);
const pageSize = 10;
```

- [ ] **Step 2: Hitung slice data transaksi untuk halaman aktif**

```tsx
const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
const startIndex = (currentPage - 1) * pageSize;
const endIndex = Math.min(startIndex + pageSize, transactions.length);
const paginatedTransactions = transactions.slice(startIndex, endIndex);
```

- [ ] **Step 3: Reset ke halaman 1 saat query atau filter berubah**

Di dalam `executeFilterQuery` dan `handleResetFilter`, pastikan `setCurrentPage(1)` dipanggil.

- [ ] **Step 4: Render tabel menggunakan `paginatedTransactions` dan tambahkan kontrol navigasi di bawah tabel**

Ganti `transactions.map` menjadi `paginatedTransactions.map`.
Tambahkan footer paginasi di bawah tabel:
```tsx
{/* Pagination Bar */}
{transactions.length > 0 && (
  <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
    <div>
      Menampilkan <span className="font-semibold text-slate-800 dark:text-slate-200">{startIndex + 1}</span> sampai{' '}
      <span className="font-semibold text-slate-800 dark:text-slate-200">{endIndex}</span> dari{' '}
      <span className="font-semibold text-slate-800 dark:text-slate-200">{transactions.length}</span> transaksi
    </div>

    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
      >
        Sebelumnya
      </button>

      <span className="px-3 py-1.5 font-semibold text-slate-800 dark:text-slate-200">
        Halaman {currentPage} dari {totalPages}
      </span>

      <button
        type="button"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
      >
        Selanjutnya
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 5: Verifikasi kompilasi dan build produksi**

Jalankan: `npm test && npm run build`
Ekspektasi: Seluruh pengujian lulus dan Next.js production build berhasil.

- [ ] **Step 6: Commit perubahan**

```bash
git add src/app/transactions/page.tsx
git commit -m "feat(transactions): add client-side pagination for transaction history table"
```

---

## Verification Plan

### Automated Tests
Jalankan seluruh rangkaian pengujian otomatis:
```bash
npm test
```
Verifikasi bahwa seluruh skenario SRS-01 s/d SRS-10 pada `auth.test.ts` dan `transactions.test.ts` lulus 100%.

Jalankan linter dan compiler TypeScript:
```bash
npm run lint
npx tsc --noEmit
npm run build
```

### Manual Verification
1. **Halaman Dashboard (`/dashboard`):**
   - Catat transaksi pengeluaran besar sehingga saldo menjadi negatif.
   - Pastikan warna angka saldo berubah menjadi merah, muncul ikon peringatan, dan muncul status teks defisit.
2. **Halaman Riwayat Transaksi (`/transactions`):**
   - Buat lebih dari 10 transaksi (misal 12 transaksi).
   - Pastikan hanya 10 transaksi yang muncul di halaman 1, dan pagination menampilkan "Halaman 1 dari 2".
   - Klik "Selanjutnya", pastikan 2 transaksi sisanya ditampilkan.
   - Ubah filter (misal jenis "Pemasukan"), pastikan pagination otomatis reset ke halaman 1.
