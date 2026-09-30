# Panduan Sprint Kerja: Modul Budget Bulanan (SRS-11 s/d SRS-15)

Dokumen ini merupakan panduan pembagian kerja sprint minggu ini untuk **3 orang programmer developer** dengan supervisi **1 Project Manager (PM)** pada proyek Expense Tracker.

---

## 1. Ringkasan Eksekutif & Struktur Tim

- **Project Manager (PM):** Bertanggung jawab memantau sprint, mengkoordinasikan arsitektur database, mereview pull request (PR), dan menguji integrasi end-to-end.
- **Anggota 1 (Dev 1):** *Core Budget & Data Isolation* (SRS-11 & SRS-15).
- **Anggota 2 (Dev 2):** *Multi-Budget Rekening & Kategori* (SRS-12).
- **Anggota 3 (Dev 3):** *Budget Summary & Visual Indicator* (SRS-13 & SRS-14).

---

## 2. Rincian Pembagian Tugas Tiap Anggota

### Anggota 1 (Dev 1): Core Budget & Data Isolation (SRS-11 & SRS-15)
* **Git Branch Rekomendasi:** `feat/budget-core`
* **Kebutuhan Fungsional:**
  * **SRS-11 (Set Budget Bulanan):** Pengguna dapat menetapkan target nominal anggaran untuk periode bulan tertentu (misal: Oktober 2026).
  * **SRS-15 (Hak Akses Mandiri):** Memastikan seluruh query dan mutasi data anggaran hanya dapat dibaca dan dikelola oleh pemilik akun yang sedang login.
* **Tugas Spesifik:**
  1. **Database Schema:** Menambahkan model `Budget` pada `prisma/schema.prisma` (field: `id`, `userId`, `month`, `year`, `targetAmount`, timestamps) dengan foreign key ke `User`.
  2. **Server Actions (`src/actions/budget.ts`):**
     - `setMonthlyBudget({ month, year, amount })`: Validasi nominal positif dan simpan/update (upsert) budget untuk user login.
     - `getCurrentBudget({ month, year })`: Mengambil data anggaran periode terkait dengan filter ketat `userId`.
  3. **UI Implementation (`src/app/budgets/page.tsx`):**
     - Form penetapan dan perubahan nominal budget bulanan dengan input periode bulan/tahun.
     - Penanganan pesan error dan feedback sukses secara reaktif.
* **Acceptance Criteria:**
  - Pengguna dapat menginput target budget (misal Rp 3.000.000) untuk bulan berjalan.
  - Pengguna lain tidak dapat melihat atau mengubah nominal budget milik pengguna tersebut (uji coba multi-user lolos).

---

### Anggota 2 (Dev 2): Multi-Budget Rekening & Kategori (SRS-12)
* **Git Branch Rekomendasi:** `feat/budget-multi-allocation`
* **Kebutuhan Fungsional:**
  * **SRS-12 (Multi-Budget Rekening & Kategori):** Pengguna dapat mengalokasikan anggaran ke dalam pos pengeluaran/kategori spesifik (makanan, transportasi, belanja, dll.) serta menghubungkannya ke sumber dana/rekening.
* **Tugas Spesifik:**
  1. **Database Schema Extension:**
     - Menambahkan model `BudgetAllocation` / `Category` (relasi ke `Budget`, nama kategori/pos, alokasi nominal).
     - Menambahkan field opsional `category` dan `account` pada model `Transaction` agar transaksi pengeluaran dapat dipetakan ke pos anggaran.
  2. **Server Actions (`src/actions/budget-allocation.ts`):**
     - `setCategoryAllocation({ budgetId, category, allocatedAmount, accountName })`.
     - `getBudgetAllocations({ budgetId })`.
  3. **UI Implementation:**
     - Komponen daftar alokasi kategori di halaman `/budgets` (menampilkan daftar pos pengeluaran dan pagu masing-masing).
     - Menambahkan pilihan dropdown kategori/pos belanja pada form transaksi pemasukan/pengeluaran (`src/components/TransactionForm.tsx`).
* **Acceptance Criteria:**
  - Pengguna dapat membagi total budget ke beberapa pos (contoh: Makanan Rp 1.500.000, Transportasi Rp 500.000).
  - Total akumulasi alokasi kategori divalidasi tidak melebihi total target budget utama.

---

### Anggota 3 (Dev 3): Budget Summary & Visual Indicator (SRS-13 & SRS-14)
* **Git Branch Rekomendasi:** `feat/budget-summary-indicator`
* **Kebutuhan Fungsional:**
  * **SRS-13 (Budget Summary):** Menampilkan ringkasan yang memuat total anggaran, akumulasi pengeluaran aktual bulan berjalan, dan sisa anggaran.
  * **SRS-14 (Budget Indicator):** Menampilkan indikator visual (persentase & warna status aman/over-budget).
* **Tugas Spesifik:**
  1. **Agregasi Data & Logic (`src/actions/budget-analytics.ts`):**
     - Mengagregasi seluruh transaksi bertipe `expense` milik user pada bulan/tahun aktif.
     - Menghitung kalkulasi:
       - `totalBudget = targetAmount`
       - `actualExpense = sum(expense.amount)`
       - `remainingBudget = totalBudget - actualExpense`
       - `percentageUsed = (actualExpense / totalBudget) * 100`
  2. **Komponen UI Visual (`src/components/BudgetSummaryWidget.tsx`):**
     - Card ringkasan: Total Budget, Pengeluaran Aktual, Sisa Anggaran.
     - Progress Bar interaktif dengan threshold warna:
       - **Hijau (Aman):** Pemakaian `< 80%`.
       - **Kuning/Oranye (Waspada):** Pemakaian `80% - 100%`.
       - **Merah (Over-Budget):** Pemakaian `> 100%` disertai badge peringatan.
  3. **Integrasi Antarmuka:**
     - Memasang kartu ringkasan dan indikator pada `/dashboard` (di atas riwayat transaksi).
     - Menyematkan rincian per-kategori pada halaman `/budgets`.
* **Acceptance Criteria:**
  - Ringkasan angka otomatis ter-update saat ada transaksi pengeluaran baru yang ditambahkan/dihapus.
  - Warna bar dan status teks berubah secara akurat sesuai ambang batas persentase pemakaian.

---

## 3. Matriks Ketergantungan & Alur Kerja (Workflow)

```
[PM: Inisiasi PR & Review]
       │
       ▼
[Anggota 1: feat/budget-core]
 - Schema Budget & Server Actions Dasar
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
[Anggota 2: feat/budget-multi-allocation]  [Anggota 3: feat/budget-summary-indicator]
 - Schema Kategori & Rekening              - Agregasi Transaksi vs Budget
 - Form Dropdown Transaksi                 - Progress Bar & Card Dashboard
       │                                         │
       └────────────────────┬────────────────────┘
                            ▼
              [PM: Code Review, Merge to main]
              [All Devs: Verifikasi Vitest Test]
```

---

## 4. Standar Kualitas & Pengujian (Quality Gate)

1. **TypeScript & Linter:** Semua kode harus bebas error `npx tsc --noEmit` dan `npm run lint`.
2. **Automated Testing (Vitest):**
   - Setiap anggota membuat file unit test di `src/actions/__tests__/` yang memvalidasi logika masing-masing:
     - `budget-core.test.ts` (Anggota 1)
     - `budget-allocation.test.ts` (Anggota 2)
     - `budget-summary.test.ts` (Anggota 3)
3. **Data Security:** Seluruh query ke Prisma wajib menyertakan filter `userId` untuk menjamin isolasi data multi-user.
