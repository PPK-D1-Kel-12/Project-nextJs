# Expense Tracker & Financial Budgeting 💰

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-8-2D3748?logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-yellow?logo=vitest)](https://vitest.dev/)
[![Tests](https://img.shields.io/badge/Tests-45%20Passed-brightgreen)](https://github.com/PPK-D1-Kel-12/Project-nextJs)

Aplikasi pencatatan keuangan pribadi dan manajemen anggaran bulanan (*Expense & Financial Budget Tracker*) berbasis web modern yang dibangun dengan arsitektur **Next.js 16 (App Router, Turbopack, Server Actions)**, **React 19**, **Tailwind CSS v4 (3D Tactile Claymorphism UI)**, **Prisma 8 ORM**, dan basis data **Supabase PostgreSQL**.

Aplikasi ini dilengkapi dengan **Mode Pengujian Mandiri / Demo Offline (Zero-Configuration Fallback)**, sehingga dapat dijalankan dan diuji di perangkat mana pun tanpa bergantung pada koneksi internet ke Supabase maupun database eksternal.

Proyek ini dikembangkan untuk memenuhi tugas mata kuliah **Praktikum Pengembangan Perangkat Lunak (PPK)** Kelas D1.

---

## 👥 Tim Pengembang (Kelompok 12 - Kelas D1)

| Peran | Nama / Akun GitHub | Tanggung Jawab & Cakupan Fitur |
|---|---|---|
| **Project Manager (PM)** | `{Zandhika13}` | Pengawasan sprint, QA & code review, arsitektur teknis, manajemen integrasi pull request, dan pengujian end-to-end. |
| **Developer 1 (Dev 1)** | `menza isaiah` | **Core Budget & Data Isolation:** Fondasi autentikasi & sesi (SRS-01 s/d SRS-04), target pagu anggaran bulanan (SRS-11), dan isolasi data mandiri pengguna (SRS-15). |
| **Developer 2 (Dev 2)** | `novelyac` | **Multi-Budget & Transaksi:** Modul transaksi & filter riwayat (SRS-05, SRS-07 s/d SRS-10), preferensi tema (SRS-06), dan alokasi multi-budget rekening & kategori (SRS-12). |
| **Developer 3 (Dev 3)** | `belajarchik` | **Budget Analytics & UI Indicator:** Mesin agregasi ringkasan anggaran vs pengeluaran aktual (SRS-13) dan widget visual indicator status anggaran dashboard (SRS-14). |

---

## 🚀 Fitur Utama & Matriks SRS

Dokumentasi lengkap kebutuhan fungsional dan non-fungsional dapat dilihat pada dokumen [`SRS.md`](./SRS.md).

### 1. Autentikasi & Sesi (SRS-01 s/d SRS-04)
- **Registrasi Akun (SRS-01):** Pendaftaran akun menggunakan email unik dan kata sandi aman.
- **Login Terautentikasi (SRS-02):** Validasi kredensial pengguna terhubung ke Supabase Auth dengan mode demo fallback instan.
- **Proteksi Rute Sesi (SRS-03):** Middleware proteksi untuk halaman privat (`/dashboard`, `/transactions`, `/budgets`).
- **Logout (SRS-04):** Pengakhiran sesi aktif dan pembersihan cookie autentikasi.

### 2. Transaksi Finansial & Dashboard (SRS-05 s/d SRS-10)
- **Dashboard Ringkasan Kas (SRS-05):** Menampilkan nama pengguna, saldo bersih (`Pemasukan - Pengeluaran`), total pemasukan, total pengeluaran, dan transaksi terbaru.
- **Preferensi Tema Terang/Gelap (SRS-06):** Pengaturan tema tersimpan persisten melalui cookie HTTP `app_theme`.
- **Pencatatan Transaksi (SRS-07):** Input pemasukan (*income*) dan pengeluaran (*expense*) dengan nominal positif, tanggal, dan deskripsi.
- **Riwayat & Filter Dinamis (SRS-08):** Penyaringan riwayat berdasarkan tipe transaksi dan rentang tanggal.
- **Manajemen Transaksi (SRS-09 & SRS-10):** Edit dan hapus transaksi dengan validasi kepemilikan data pengguna.

### 3. Modul Anggaran Bulanan (SRS-11 s/d SRS-15)
- **Target Pagu Bulanan (SRS-11):** Penetapan nominal target pagu belanja per periode bulan dan tahun (`YYYY-MM`).
- **Multi-Budget Rekening & Kategori (SRS-12):** Pengelolaan rekening sumber dana, pos kategori belanja, dan alokasi anggaran multi-rekening per kategori.
- **Ringkasan Anggaran / Budget Summary (SRS-13):** Kalkulasi otomatis pagu target, realisasi pengeluaran berjalan, dan sisa anggaran (atau defisit).
- **Indikator Visual Progresif (SRS-14):** Progress bar adaptif dengan penanda status dinamis:
  - 🟢 **Aman:** Pemakaian `< 80%`
  - 🟡 **Waspada:** Pemakaian `80% - 100%`
  - 🔴 **Over-Budget:** Pemakaian `> 100%` disertai badge peringatan
- **Isolasi Data Mandiri (SRS-15):** Penjaminan seluruh query dan mutasi data hanya dapat diakses oleh pemilik akun (`auth.uid()` & Supabase Row-Level Security).

---

## 🛠️ Tech Stack & Arsitektur

- **Framework:** [Next.js 16 (Turbopack, App Router)](https://nextjs.org)
- **Frontend Library:** [React 19](https://react.dev)
- **Bahasa Pemrograman:** [TypeScript 5](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) (3D Tactile Claymorphism UI)
- **Database:** PostgreSQL via [Supabase](https://supabase.com)
- **ORM:** [Prisma 8](https://www.prisma.io) (Compiled schema contract)
- **Testing Engine:** [Vitest 3.2](https://vitest.dev)

---

## 📁 Struktur Direktori

```text
├── docs/                             # Panduan arsitektur, sprint plan, dan implementasi
│   ├── multi-budget.md               # Dokumentasi modul alokasi multi-budget (SRS-12)
│   ├── sprint-budget-plan.md         # Panduan pembagian tugas sprint mingguan
│   └── superpowers/plans/            # Dokumen rencana teknis harmonisasi fitur
├── prisma/                           # Skema kontrak Prisma 8
│   ├── schema.d.ts
│   └── schema.json
├── src/
│   ├── actions/                      # Next.js Server Actions ('use server')
│   │   ├── __tests__/                # Unit & integration tests Vitest (45 tests)
│   │   ├── auth.ts                   # Logika registrasi, login, & session
│   │   ├── budget-analytics.ts       # Kalkulasi summary & visual indicator (SRS-13 & SRS-14)
│   │   ├── budget.ts                 # Logika target pagu bulanan (SRS-11 & SRS-15)
│   │   ├── budgets.ts                # Logika alokasi rekening & kategori (SRS-12)
│   │   ├── theme.ts                  # Persistensi preferensi tema cookie (SRS-06)
│   │   └── transactions.ts           # Logika transaksi & ringkasan dashboard (SRS-05, SRS-07 s/d 10)
│   ├── app/                          # Next.js App Router Pages
│   │   ├── budgets/                  # Halaman pengelolaan anggaran (/budgets)
│   │   ├── dashboard/                # Halaman ringkasan dashboard (/dashboard)
│   │   ├── login/ & register/        # Halaman autentikasi
│   │   └── transactions/             # Halaman riwayat & pencatatan transaksi (/transactions)
│   ├── components/                   # Komponen UI modular (Claymorphism 3D)
│   │   ├── auth/                     # Form login, register, & tombol logout
│   │   ├── budgets/                  # Form budget, tabel history, & workspace alokasi
│   │   ├── budget-summary-widget.tsx # Widget indikator visual status anggaran (SRS-14)
│   │   └── navbar.tsx                # Navigasi utama & switch tema dark/light
│   └── lib/                          # Utility & inisialisasi client database
│       ├── auth-user.ts              # Resolusi pengguna terautentikasi
│       ├── budgets.ts                # Logika komparasi pagu vs alokasi
│       ├── prisma.ts                 # Prisma DB instance
│       └── supabase/                 # Supabase client (browser, server, middleware)
├── supabase/
│   └── migrations/                   # Script SQL migrasi & RLS policies
└── SRS.md                            # Software Requirements Specification resmi
```

---

## ⚙️ Panduan Menjalankan Aplikasi

Aplikasi ini didesain dengan prinsip **Zero-Configuration Fallback**. Jika kredensial Supabase belum diisi atau koneksi jaringan ke cloud tidak tersedia, aplikasi secara otomatis mengaktifkan *In-Memory Store* dan *Demo Auth Session*.

### Skenario 1: Menjalankan Cepat (Mode Demo / Offline)

Gunakan cara ini untuk pengujian instan tanpa perlu menyiapkan akun Supabase:

1. **Clone repositori dan install dependencies:**
   ```bash
   git clone https://github.com/PPK-D1-Kel-12/Project-nextJs.git
   cd Project-nextJs
   npm install
   ```

2. **Jalankan development server:**
   ```bash
   npm run dev
   ```

3. **Buka di browser:**
   - Akses [http://localhost:3000](http://localhost:3000).
   - Di halaman login, klik tombol **"Masuk Cepat Mode Demo"** untuk langsung masuk ke dashboard dengan data demo yang sudah siap diuji.

---

### Skenario 2: Mengakses dari HP / Device Lain Lewat WiFi (LAN)

1. Pastikan laptop/PC dan HP terhubung ke **jaringan WiFi yang sama**.
2. Jalankan server dengan binding IP:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
3. Cek IP lokal laptop Anda (misal `192.168.1.10`) lewat `ipconfig` (Windows) atau `ifconfig` (Mac/Linux).
4. Buka browser di HP dan ketik: `http://192.168.1.10:3000`.

---

### Skenario 3: Menghubungkan ke Database Supabase Cloud

1. Salin `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Lengkapi kredensial Supabase Anda di `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

   NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="[YOUR-PUBLISHABLE-KEY]"
   ```

3. Jalankan file SQL migrasi di menu **SQL Editor** pada Supabase Dashboard:
   - `supabase/migrations/202609300001_multi_budget.sql`

4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

---

## 🧪 Pengujian Otomatis (Automated Testing)

Proyek ini dilengkapi dengan **45 unit & integration test cases** otomatis menggunakan framework **Vitest** yang menguji seluruh fungsionalitas server actions, otentikasi, isolasi data multi-user, transaksi finansial, hingga modul kalkulasi anggaran.

Untuk menjalankan seluruh test suite:
```bash
npm test
```

Untuk memverifikasi kompilasi build produksi Next.js:
```bash
npm run build
```

---

## 📄 Lisensi & Hak Cipta
Dikembangkan oleh **Kelompok 12 (Kelas D1)** untuk keperluan akademis **Praktikum Pengembangan Perangkat Lunak (PPK)**.
