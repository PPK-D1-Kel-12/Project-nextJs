# Software Requirements Specification (SRS) - Expense Tracker

**Proyek:** Expense Tracker & Financial Budgeting Application  
**Mata Kuliah:** Praktikum Pengembangan Perangkat Lunak (PPK)  
**Kelompok:** Kelompok 12 - Kelas D1  

---

## 1. Gambaran Umum Sistem (System Overview)

### 1.1 Deskripsi Produk
Expense Tracker adalah aplikasi pencatatan keuangan pribadi modern berbasis web yang dibangun dengan arsitektur Next.js App Router, Server Actions, Prisma ORM, dan PostgreSQL Supabase. Aplikasi ini memungkinkan pengguna untuk memantau arus kas pribadi (pemasukan dan pengeluaran), menetapkan target anggaran bulanan, memetakan pos alokasi dana dari berbagai rekening/sumber kas ke kategori belanja, serta memantau status batas belanja secara visual dan reaktif melalui indikator dashboard.

### 1.2 Tujuan Sistem
- Menyediakan platform pencatatan transaksi keuangan yang cepat, aman, dan terisolasi per akun pengguna.
- Memberikan kontrol anggaran proaktif dengan peringatan visual saat pengeluaran mendekati atau melampaui pagu target bulanan.
- Memfasilitasi alokasi dana multi-rekening dan multi-kategori untuk perencanaan keuangan yang terstruktur.

### 1.3 Karakteristik & Hak Akses Pengguna
Setiap pengguna yang terdaftar berstatus pengguna mandiri (*authenticated user*). Sistem secara ketat menerapkan prinsip privasi dan isolasi data: seorang pengguna hanya berhak membaca, menambah, mengubah, dan menghapus data keuangan (transaksi, rekening, kategori, dan anggaran) miliknya sendiri.

---

## 2. Struktur Tim dan Pembagian Peran

Proyek pengembangan aplikasi Expense Tracker ini dikerjakan secara kolaboratif oleh tim beranggotakan 4 orang:
- **Project Manager (PM):** Mengawasi jalannya sprint proyek, melakukan code review & QA, koordinasi arsitektur teknis, manajemen branch/pull request, serta memantau integrasi fitur antar-developer.
- **Anggota 1 (Dev 1 - Core Budget & Data Isolation):** Bertanggung jawab atas pengelolaan target pagu anggaran bulanan utama dan penjaminan hak akses mandiri data anggaran (SRS-11 & SRS-15), serta fondasi autentikasi & sesi (SRS-01 s/d SRS-04).
- **Anggota 2 (Dev 2 - Multi-Budget Rekening & Kategori):** Bertanggung jawab atas pengelolaan rekening sumber dana, kategori pengeluaran, alokasi multi-budget rekening & kategori (SRS-12), serta modul transaksi finansial & dashboard utama (SRS-05 s/d SRS-10).
- **Anggota 3 (Dev 3 - Budget Summary & Visual Indicator):** Bertanggung jawab atas kalkulasi ringkasan anggaran vs pengeluaran aktual serta indikator visual status anggaran pada dashboard utama (SRS-13 & SRS-14).

---

## 3. Kebutuhan Fungsional (Functional Requirements)

### 3.1 Kebutuhan Fungsional Fondasi (Core Features: SRS-01 s/d SRS-10)

| ID | Anggota | Fitur | Kebutuhan Fungsional |
|---|---|---|---|
| **SRS-01** | Dev 1 | Register | Sistem harus memungkinkan pengguna membuat akun menggunakan email unik dan password. |
| **SRS-02** | Dev 1 | Login | Sistem harus memvalidasi email dan password, serta memberikan akses aplikasi jika kredensial valid. |
| **SRS-03** | Dev 1 | Session | Sistem harus mempertahankan status login selama session aktif dan mewajibkan pengguna login untuk mengakses halaman yang dilindungi (`/dashboard`, `/transactions`, `/budgets`). |
| **SRS-04** | Dev 1 | Logout | Sistem harus memungkinkan pengguna logout dengan mengakhiri session dan mengarahkan pengguna ke halaman login. |
| **SRS-05** | Dev 2 | Dashboard | Sistem harus menampilkan nama pengguna, saldo (total pemasukan dikurangi total pengeluaran), total pemasukan, total pengeluaran, dan daftar transaksi terbaru milik pengguna yang login. |
| **SRS-06** | Dev 2 | Cookie preferensi | Sistem harus memungkinkan pengguna memilih tema terang atau gelap, menyimpan pilihan tersebut dalam cookie (`app_theme`), dan menerapkannya kembali saat pengguna membuka aplikasi. |
| **SRS-07** | Dev 2 | Tambah transaksi | Sistem harus memungkinkan pengguna mencatat transaksi dengan jenis pemasukan atau pengeluaran, nominal positif, tanggal, dan keterangan, serta menghubungkannya secara aman dengan pengguna yang login. |
| **SRS-08** | Dev 2 | Riwayat dan filter transaksi | Sistem harus menampilkan riwayat transaksi milik pengguna yang login pada halaman transaksi dan memungkinkan penyaringan berdasarkan jenis transaksi serta rentang tanggal. |
| **SRS-09** | Dev 2 | Ubah transaksi | Sistem harus memungkinkan pengguna mengubah data transaksi miliknya dan memperbarui ringkasan dashboard sesuai perubahan tersebut. |
| **SRS-10** | Dev 2 | Hapus transaksi | Sistem harus memungkinkan pengguna menghapus transaksi miliknya dan memperbarui ringkasan dashboard, serta menolak setiap upaya mengakses, mengubah, atau menghapus transaksi milik pengguna lain. |

### 3.2 Kebutuhan Fungsional Modul Budgeting (Sprint Anggaran: SRS-11 s/d SRS-15)

| ID | Anggota | Fitur | Kebutuhan Fungsional |
|---|---|---|---|
| **SRS-11** | Dev 1 | Set budget bulanan | Sistem harus memungkinkan pengguna menetapkan target nominal anggaran (pagu belanja) untuk periode bulan dan tahun tertentu (`YYYY-MM`). |
| **SRS-12** | Dev 2 | Multi-budget (rekening & kategori) | Sistem harus memungkinkan pembuatan rekening/sumber dana, kategori belanja, serta alokasi anggaran dari rekening ke pos pengeluaran/kategori spesifik untuk periode bulan aktif. |
| **SRS-13** | Dev 3 | Budget summary | Sistem harus menampilkan ringkasan anggaran bulanan yang memuat total pagu anggaran, akumulasi pengeluaran aktual dari transaksi pada bulan tersebut, dan sisa anggaran (atau defisit). |
| **SRS-14** | Dev 3 | Budget indicator | Sistem harus menampilkan indikator visual status pemakaian anggaran berupa persentase pemakaian dan penanda status (Aman `< 80%`, Waspada `80% - 100%`, Melebihi Anggaran `> 100%`) dengan progress bar adaptif. |
| **SRS-15** | Dev 1 | Hak akses mandiri | Sistem harus memastikan setiap pengguna hanya dapat melihat, mengatur, dan memantau data anggaran, pos rekening/kategori, serta transaksi miliknya sendiri (*multi-user isolation*). |

---

## 4. User Stories & Acceptance Criteria

### Anggota 1 (Dev 1 - Core Budget & Data Isolation)
- **US-11 (Set Budget Bulanan):** Sebagai pengguna, saya ingin menetapkan target nominal anggaran untuk periode bulan tertentu melalui halaman `/budgets` agar batas belanja bulanan saya terencana dengan jelas.
  - *Acceptance Criteria:* Pengguna dapat menginput atau memperbarui target pagu bulanan (misal: Rp 5.000.000). Sistem menolak nominal negatif atau nol dan melakukan upsert secara otomatis untuk periode bulan/tahun yang sama.
- **US-15 (Hak Akses Mandiri Data Budget):** Sebagai pengguna, saya ingin memastikan seluruh data anggaran dan rencana keuangan saya sepenuhnya privat dan terisolasi, hanya dapat diakses dan diubah oleh akun saya sendiri.
  - *Acceptance Criteria:* Seluruh kueri dan mutasi Prisma/Supabase memvalidasi `userId` sesi aktif. Upaya manipulasi ID budget milik pengguna lain langsung ditolak oleh sistem dan Row-Level Security (RLS).

### Anggota 2 (Dev 2 - Multi-Budget Rekening & Kategori)
- **US-12 (Multi-Budget Rekening & Kategori):** Sebagai pengguna, saya ingin mengelola rekening/sumber dana (misal: BCA, Tunai, GoPay) dan pos kategori belanja (misal: Makanan, Transportasi, Tagihan), lalu mengalokasikan anggaran per rekening ke pos belanja pada periode bulan aktif.
  - *Acceptance Criteria:* Satu rekening dapat membiayai banyak kategori dan sebaliknya. Kombinasi rekening + kategori + periode divalidasi unik. Terdapat komparasi antara total yang dialokasikan terhadap pagu target bulanan.

### Anggota 3 (Dev 3 - Budget Summary & Visual Indicator)
- **US-13 (Budget Summary):** Sebagai pengguna, saya ingin melihat kartu ringkasan anggaran bulanan yang menyajikan total pagu target, akumulasi realisasi pengeluaran pada bulan berjalan, serta sisa saldo anggaran yang masih dapat dibelanjakan.
  - *Acceptance Criteria:* Ringkasan otomatis menghitung: `remainingBudget = targetBudget - actualExpense`. Jika `actualExpense > targetBudget`, ringkasan menampilkan status defisit.
- **US-14 (Budget Indicator):** Sebagai pengguna, saya ingin melihat indikator visual (persentase penggunaan dan status: Aman vs Waspada vs Over-Budget) pada dashboard utama dan halaman anggaran agar mendapat peringatan dini saat pengeluaran mendekati atau melampaui limit.
  - *Acceptance Criteria:* Progress bar otomatis menyesuaikan warna (Hijau untuk `< 80%`, Kuning untuk `80% - 100%`, Merah berdenyut untuk `> 100%`) dan menampilkan badge status yang relevan.

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements / NFR)

| ID | Kategori | Kebutuhan Non-Fungsional |
|---|---|---|
| **NFR-01** | Keamanan (Security) | Sistem wajib menerapkan isolasi multi-tenant berbasis `userId` pada seluruh operasi database, enkripsi kredensial pengguna melalui Supabase Auth, serta pengamanan rute terproteksi melalui middleware Next.js. |
| **NFR-02** | Row Level Security | Tabel basis data multi-budget (`budget_accounts`, `budget_categories`, `budget_allocations`) wajib mengaktifkan Row-Level Security (RLS) PostgreSQL untuk membatasi hak akses kueri dan mutasi hanya kepada pemilik data (`auth.uid() = user_id`). |
| **NFR-03** | Keandalan (Reliability) | Sistem harus menyediakan penanganan error (*graceful error handling*) yang informatif dan mekanisme *fallback in-memory store* untuk memastikan pengujian unit otomatis dapat dieksekusi tanpa ketergantungan koneksi jaringan eksternal. |
| **NFR-04** | Usability & Preferensi | Sistem wajib mendukung persistensi tema tampilan (terang / gelap) yang disimpan dalam cookie HTTP (`app_theme`) dan dapat diterapkan secara konsisten di seluruh halaman aplikasi tanpa *hydration mismatch*. |
| **NFR-05** | Responsivitas Antarmuka | Antarmuka pengguna harus sepenuhnya responsif untuk berbagai ukuran layar (perangkat seluler, tablet, hingga desktop) menggunakan utilitas styling Tailwind CSS. |
| **NFR-06** | Integritas Validasi Data | Seluruh input numerik nominal transaksi dan anggaran wajib divalidasi bertipe bilangan bulat positif dengan batasan nilai rasional (maksimal Rp 1.000.000.000.000). |

---

## 6. Batasan Sistem dan Asumsi Teknis (System Constraints)

1. **Framework & Runtime:** Next.js 16 (Turbopack, App Router, React 19) dengan Next.js Server Actions (`'use server'`).
2. **Bahasa Pemrograman:** TypeScript dengan pengecekan tipe ketat (*strict mode*).
3. **Database & ORM:** Supabase PostgreSQL sebagai basis data relasional utama, diakses melalui Prisma 8 ORM (kontrak skema terkompilasi) dan Supabase Client terautentikasi.
4. **Format Periode:** Periode anggaran direpresentasikan dengan format kalender standar ISO `YYYY-MM` (rentang tahun 2000 s/d 9999 dan bulan 01 s/d 12), disinkronkan melalui parameter query URL `?month=YYYY-MM`.
5. **Testing & Quality Assurance:** Pengujian logika bisnis dan server action wajib mencakup uji unit dan integrasi otomatis berbasis Vitest dengan tingkat keberhasilan 100%.
