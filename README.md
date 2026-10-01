# Expense Tracker App 💰

Aplikasi pencatatan keuangan pribadi dan manajemen anggaran bulanan (*Expense & Budget Tracker*) berbasis web modern yang dibangun menggunakan **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Prisma ORM v8**, dan **Supabase**.

Aplikasi ini dilengkapi dengan **Mode Pengujian Mandiri / Demo Offline**, sehingga dapat dijalankan dan diuji di perangkat mana pun tanpa bergantung pada koneksi internet ke Supabase maupun database eksternal.

---

## 📌 Fitur Utama (Spesifikasi Kebutuhan Sistem / SRS)

Proyek ini telah mengimplementasikan seluruh kebutuhan fungsional **SRS-01 s/d SRS-15**:

### 1. Autentikasi & Manajemen Sesi (SRS-01 s/d SRS-04)
- **Registrasi & Login Akun:** Pendaftaran akun baru dan login aman dengan validasi input.
- **Manajemen Sesi:** Proteksi rute berbasis sesi autentikasi dan auto-redirect.
- **Mode Demo Instan (Pengujian Mandiri):** Tombol masuk cepat tanpa perlu konfigurasi Supabase untuk keperluan testing manual.
- **Logout:** Pembersihan sesi pengguna dan pengalihan kembali ke halaman login.

### 2. Transaksi Finansial & Dashboard (SRS-05 s/d SRS-10)
- **Ringkasan Saldo:** Perhitungan otomatis saldo bersih (`Total Pemasukan - Total Pengeluaran`).
- **Pencatatan Transaksi:** Tambah, ubah, dan hapus transaksi (pemasukan/pengeluaran) dengan nominal positif, tanggal, dan deskripsi.
- **Riwayat & Filter Lanjutan:** Tampilan daftar transaksi dengan filter jenis transaksi serta rentang tanggal.
- **Isolasi Data Pengguna:** Jaminan keamanan bahwa setiap pengguna hanya dapat melihat dan memodifikasi transaksinya sendiri.
- **Preferensi Tema:** Dukungan tema Terang (*Light*) dan Gelap (*Dark*) yang tersimpan via cookie.

### 3. Manajemen Anggaran Bulanan / Monthly Budget (SRS-11 s/d SRS-15)
- **Target Anggaran Bulanan (SRS-11):** Menetapkan target batas pengeluaran untuk periode bulan dan tahun berjalan.
- **Alokasi Multi-Budget (SRS-12):** Pengelolaan sumber dana/rekening dan alokasi ke pos kategori pengeluaran spesifik.
- **Ringkasan Anggaran / Budget Summary (SRS-13):** Dashboard widget interaktif yang membandingkan target anggaran, akumulasi pengeluaran aktual dari transaksi, dan sisa anggaran.
- **Indikator Status Visual (SRS-14):** Progress bar dinamis dan indikator status:
  - 🟢 **Aman (< 80%):** Pengeluaran masih berada dalam batas aman.
  - 🟡 **Waspada (80% – 100%):** Pengeluaran mendekati batas limit anggaran.
  - 🔴 **Melebihi Anggaran (> 100%):** Pengeluaran telah melampaui target anggaran yang ditetapkan.
- **Hak Akses Mandiri Anggaran (SRS-15):** Data anggaran terisolasi penuh per `userId`.

---

## 👥 Struktur Tim & Pembagian Peran

| Peran | Tanggung Jawab & Modul |
|---|---|
| **Project Manager (PM)** | Quality Assurance, Code Review, integrasi arsitektur, dan sinkronisasi branch. |
| **Anggota 1 (Dev 1)** | Core Budget Bulanan & Isolasi Data (`/budgets`, SRS-11 & SRS-15) serta Autentikasi & Sesi (SRS-01 s/d SRS-04). |
| **Anggota 2 (Dev 2)** | Alokasi Multi-Budget Rekening & Kategori (SRS-12) serta Modul Transaksi & Dashboard Utama (SRS-05 s/d SRS-10). |
| **Anggota 3 (Dev 3)** | Budget Summary Widget, Kalkulasi Analitik, dan Indikator Visual Status Anggaran (SRS-13 & SRS-14). |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16.3 (App Router & Turbopack)
- **Library UI:** React 19
- **Styling:** Tailwind CSS v4
- **ORM & Database:** Prisma v8 (dengan fallback in-memory store untuk dev/offline)
- **Autentikasi:** Supabase SSR (dengan fallback cookie-based demo auth session)
- **Unit Testing:** Vitest (100% test coverage pada seluruh fungsi kritis & server actions)

---

## 🚀 Panduan Menjalankan Proyek di Device Lain (Tanpa Supabase)

Aplikasi ini didesain dengan prinsip **Zero-Configuration Fallback**. Jika kredensial Supabase tidak diisi atau koneksi jaringan ke cloud tidak tersedia, aplikasi secara otomatis mengaktifkan *In-Memory Store* dan *Demo Auth Session*.

Berikut adalah panduan lengkap untuk menjalankannya:

### Skenario 1: Menjalankan di Komputer / Laptop Baru (Clone Proyek)

Gunakan cara ini jika teman atau penguji ingin menjalankan aplikasi di komputer mereka sendiri:

#### 1. Prasyarat
- Pastikan telah terinstall **Node.js** (versi 20 atau lebih baru direkomendasikan).
- Git telah terpasang.

#### 2. Clone Repositori
```bash
git clone https://github.com/PPK-D1-Kel-12/Project-nextJs.git
cd Project-nextJs
```

#### 3. Install Dependencies
```bash
npm install
```

#### 4. Siapkan File Environment (`.env.local`) — Prinsip Zero-Configuration Fallback

Aplikasi Expense Tracker ini telah dirancang dengan arsitektur **Zero-Configuration Fallback**. Anda tidak perlu mendaftar akun Supabase, membuat database PostgreSQL, ataupun menyalin API Key asli jika hanya ingin menjalankan, menguji, atau mendemonstrasikan aplikasi di device baru.

##### Langkah Praktis:
Cukup duplikasi file template `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

File `.env.local` default akan berisi placeholder seperti berikut:
```env
# PostgreSQL Connection String (Placeholder aman untuk pengujian offline)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Project Credentials (Placeholder)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="[YOUR-PUBLISHABLE-KEY]"
```

> 💡 **PENTING:** Anda **TIDAK PERLU** mengubah nilai placeholder `[PROJECT-REF]`, `[YOUR-PASSWORD]`, atau `[YOUR-ANON-KEY]`. Biarkan apa adanya!

---

##### Bagaimana Sistem Menangani Fallback Tanpa Supabase?
Arsitektur aplikasi secara cerdas mendeteksi status konfigurasi dan otomatis mengalihkan seluruh alur kerja ke komponen lokal:

1. **Deteksi Otomatis Kredensial (`isSupabaseConfigured`):**
   Pada layer server (`src/actions/auth.ts`), sistem memeriksa apakah URL atau API Key masih memuat placeholder `[PROJECT-REF]` atau belum terisi. Jika ya, sistem menandai bahwa Supabase sedang *offline/tidak dikonfigurasi*.

2. **Autentikasi Lokal Mandiri (Demo Session Cookie):**
   - Saat pengguna mengklik tombol **"Masuk Cepat Mode Demo"** atau melakukan registrasi/login biasa, sistem langsung menerbitkan cookie sesi lokal (`demo_auth_session`).
   - Sesi ini tidak melakukan panggilan jaringan HTTP keluar ke server Supabase, sehingga proses login berlangsung instan (0 milidetik).

3. **In-Memory Store untuk Transaksi & Anggaran:**
   - Client Prisma (`prisma/db.ts`) memeriksa validitas `DATABASE_URL`. Jika masih berupa template placeholder, koneksi database eksternal tidak diinisialisasi.
   - Server Action untuk transaksi (`transactions.ts`) dan anggaran (`budget.ts` & `budget-analytics.ts`) secara otomatis beralih ke penyimpanan memori lokal (*global in-memory map*).
   - Pengguna tetap dapat melakukan **Tambah**, **Ubah**, **Hapus**, dan **Filter** transaksi serta **Mengatur Target Anggaran** layaknya aplikasi yang terhubung ke database asli.

4. **Perlindungan Anti-Hang (1.5-Detik Network Timeout):**
   - Middleware dan resolver pengguna (`src/lib/auth-user.ts`) dilengkapi batas waktu 1.5 detik menggunakan `Promise.race`.
   - Hal ini memastikan browser **tidak akan pernah mengalami loading terus-menerus (*hang*)** meskipun device kehilangan koneksi internet atau memuat font/kunci palsu.

5. **Auto-Seeded Mock Data:**
   - Profil demo otomatis mendapatkan saldo dan riwayat transaksi awal serta target anggaran Rp 3.000.000, sehingga widget analitik dan indikator status anggaran (Aman / Waspada / Melebihi Anggaran) langsung aktif dan interaktif saat pertama kali dibuka.

---

##### Perbandingan Mode Operasional:

| Aspek | Mode Demo / Offline (Zero-Config) | Mode Produksi (Terkoneksi Supabase) |
|---|---|---|
| **Persyaratan .env.local** | Cukup placeholder bawaan `.env.example` | Diisi Project URL, Anon Key, & DB Password asli |
| **Koneksi Internet** | **Tidak Diperlukan** (Bisa Full Offline / Localhost) | Wajib terkoneksi ke cloud Supabase |
| **Penyimpanan Data** | Global In-Memory Cache (Reset saat server restart) | Tersimpan permanen di PostgreSQL |
| **Kecepatan Respons** | Sangat Cepat (< 10ms tanpa latensi jaringan) | Bergantung pada latensi jaringan ke server Supabase |
| **Tujuan Penggunaan** | Pengujian manual, demo tim, evaluasi kode, presentasi | Deployment produksi pengguna nyata |

---

#### 5. Jalankan Server Development
```bash
npm run dev
```

#### 6. Akses Aplikasi & Uji Coba
1. Buka browser dan arahkan ke:
   ```
   http://localhost:3000
   ```
2. Anda akan diarahkan ke halaman `/login`.
3. Klik tombol hijau: **"Masuk Cepat Mode Demo (Pengujian)"**.
4. Anda akan langsung masuk ke Dashboard dengan data demo awal (transaksi, ringkasan saldo, dan widget target anggaran) yang dapat diubah, ditambah, atau dihapus secara instan.

---

### Skenario 2: Mengakses dari Perangkat Lain (HP / Tablet / Laptop Lain) di Wi-Fi yang Sama

Gunakan cara ini jika server dijalankan di 1 laptop host, dan ingin dibuka dari smartphone atau device teman tanpa perlu instalasi ulang:

#### 1. Hubungkan ke Wi-Fi / Jaringan yang Sama
Pastikan laptop host (yang menjalankan `next dev`) dan perangkat penguji (HP/laptop teman) berada di satu jaringan Wi-Fi atau Hotspot yang sama.

#### 2. Jalankan Dev Server dengan Host `0.0.0.0`
Di komputer host, jalankan perintah:
```bash
npm run dev -- -H 0.0.0.0
```
*(Next.js versi 16 juga otomatis menampilkan alamat Network saat server dijalankan).*

#### 3. Ketahui IP Lokal Laptop Host
- **macOS / Linux:**
  ```bash
  ipconfig getifaddr en0
  # atau: ifconfig | grep "inet " | grep -v 127.0.0.1
  ```
- **Windows:**
  ```cmd
  ipconfig
  ```
  *(Cari bagian **IPv4 Address**, misalnya: `192.168.1.15` atau `10.137.45.34`)*

#### 4. Buka di Browser Perangkat Lain
Di HP atau laptop teman, buka peramban web (Chrome / Safari / Firefox) dan masukkan alamat:
```
http://<IP_HOST>:3000
```
*Contoh:* `http://192.168.1.15:3000` atau `http://10.137.45.34:3000`

#### 5. Masuk via Mode Demo
Klik tombol **"Masuk Cepat Mode Demo (Pengujian)"** pada layar login untuk mulai mencoba seluruh fitur aplikasi secara langsung dari device tersebut.

---

## 🧪 Pengujian Otomatis (Testing)

Proyek ini telah dilengkapi dengan rangkaian pengujian unit menggunakan **Vitest**:

```bash
# Menjalankan seluruh unit test
npm test

# Menjalankan test dengan mode watch (interaktif)
npx vitest

# Memeriksa validasi tipe TypeScript
npx tsc --noEmit

# Memeriksa build produksi
npm run build
```

**Cakupan Unit Test yang Lolos (41/41 Tests - 100%):**
- `src/__tests__/smoke.test.ts` & `src/__tests__/pagination.test.ts`: Uji render & paginasi.
- `src/actions/__tests__/auth.test.ts`: Validasi format email, sandi, dan manajemen sesi.
- `src/actions/__tests__/transactions.test.ts`: CRUD transaksi dan proteksi hak akses pengguna (SRS-10).
- `src/actions/__tests__/budgets.test.ts`: Validasi alokasi rekening & kategori.
- `src/actions/__tests__/budget-core.test.ts`: Penetapan target anggaran & isolasi data pengguna (SRS-11 & SRS-15).
- `src/actions/__tests__/budget-analytics.test.ts`: Ambang batas indikator visual (`SAFE`, `WARNING`, `OVER_BUDGET`) dan ringkasan anggaran bulanan (SRS-13 & SRS-14).

---

## 📁 Struktur Direktori Utama

```text
├── src/
│   ├── actions/                  # Next.js Server Actions (CRUD & Bisnis Logika)
│   │   ├── auth.ts               # Autentikasi (Supabase + Demo Fallback)
│   │   ├── budget.ts             # Pengaturan Target Anggaran & Isolasi Data
│   │   ├── budget-analytics.ts   # Ringkasan Anggaran & Status Indikator
│   │   ├── budgets.ts            # Alokasi Multi-Budget Rekening & Kategori
│   │   └── transactions.ts       # Manajemen Transaksi & Saldo Keuangan
│   ├── app/                      # Next.js App Router Pages
│   │   ├── dashboard/            # Dashboard Keuangan & Widget Anggaran
│   │   ├── budgets/              # Halaman Manajemen & Alokasi Anggaran
│   │   ├── transactions/         # Riwayat & Formulir Transaksi
│   │   ├── login/                # Halaman Masuk Akun & Mode Demo
│   │   └── register/             # Halaman Pendaftaran Akun
│   ├── components/               # Komponen Antarmuka Reusable
│   │   ├── budget-summary-widget.tsx  # Widget Indikator Visual Anggaran
│   │   ├── auth/                 # Form Login & Register
│   │   └── theme-toggle.tsx      # Pengalih Mode Gelap/Terang
│   └── lib/                      # Helper & Perhitungan Murni
│       ├── budget.ts             # Logika kalkulasi metrik & threshold anggaran
│       ├── auth-user.ts          # Resolver user sesi dengan fallback timeout
│       └── prisma.ts             # Prisma DB client
├── prisma/                       # Skema Database & Kontrak Prisma v8
│   └── schema.prisma
├── SRS.md                        # Dokumen Spesifikasi Kebutuhan Sistem
└── README.md                     # Panduan Proyek & Dokumentasi Teknis
```

---

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan akademik dan kolaborasi tim pengembangan perangkat lunak (PPK Kelompok 12).
