# SRS Expense Tracker

## Struktur Tim dan Pembagian Peran

Proyek pengembangan aplikasi Expense Tracker ini dikerjakan oleh tim beranggotakan 4 orang:
- **Project Manager (PM):** Mengawasi keseluruhan jalannya proyek, melakukan code review & QA, koordinasi arsitektur teknis, serta memantau integrasi fitur antar-developer (monitoring & coding).
- **Anggota 1 (Dev 1 - Core Budget & Data Isolation):** Bertanggung jawab atas pengelolaan target anggaran bulanan dan penjaminan hak akses mandiri data anggaran (SRS-11 & SRS-15), serta fondasi autentikasi & sesi (SRS-01 s/d SRS-04).
- **Anggota 2 (Dev 2 - Multi-Budget Rekening & Kategori):** Bertanggung jawab atas alokasi multi-budget rekening & kategori serta integrasinya ke transaksi (SRS-12), serta modul transaksi finansial & dashboard utama (SRS-05 s/d SRS-10).
- **Anggota 3 (Dev 3 - Budget Summary & Visual Indicator):** Bertanggung jawab atas kalkulasi ringkasan anggaran vs pengeluaran aktual serta indikator visual status anggaran pada dashboard (SRS-13 & SRS-14).

---

## Kebutuhan Fungsional

### 1. Kebutuhan Fungsional Sebelumnya (Core Features)

| ID | Anggota | Fitur | Kebutuhan Fungsional |
|---|---|---|---|
| SRS-01 | 1 | Register | Sistem harus memungkinkan pengguna membuat akun menggunakan email unik dan password. |
| SRS-02 | 1 | Login | Sistem harus memvalidasi email dan password, serta memberikan akses aplikasi jika kredensial valid. |
| SRS-03 | 1 | Session | Sistem harus mempertahankan status login selama session aktif dan mewajibkan pengguna login untuk mengakses halaman yang dilindungi. |
| SRS-04 | 1 | Logout | Sistem harus memungkinkan pengguna logout dengan mengakhiri session dan mengarahkan pengguna ke halaman login. |
| SRS-05 | 2 | Dashboard | Sistem harus menampilkan nama pengguna, saldo yang dihitung dari total pemasukan dikurangi total pengeluaran, total pemasukan, total pengeluaran, dan transaksi terbaru milik pengguna yang login. |
| SRS-06 | 2 | Cookie preferensi | Sistem harus memungkinkan pengguna memilih tema terang atau gelap, menyimpan pilihan tersebut dalam cookie, dan menerapkannya kembali saat pengguna membuka aplikasi. |
| SRS-07 | 2 | Tambah transaksi | Sistem harus memungkinkan pengguna mencatat transaksi dengan jenis pemasukan atau pengeluaran, nominal positif, tanggal, dan keterangan, serta menghubungkannya dengan pengguna yang login. |
| SRS-08 | 2 | Riwayat dan filter transaksi | Sistem harus menampilkan riwayat transaksi milik pengguna yang login pada halaman transaksi dan memungkinkan penyaringan berdasarkan jenis transaksi serta rentang tanggal. |
| SRS-09 | 2 | Ubah transaksi | Sistem harus memungkinkan pengguna mengubah transaksi miliknya dan memperbarui ringkasan dashboard sesuai perubahan tersebut. |
| SRS-10 | 2 | Hapus transaksi | Sistem harus memungkinkan pengguna menghapus transaksi miliknya dan memperbarui ringkasan dashboard, serta menolak setiap upaya mengakses, mengubah, atau menghapus transaksi milik pengguna lain. |

### 2. Kebutuhan Fungsional Sprint Minggu Ini: Budget Bulanan (Pembagian 3 Orang)

| ID | Anggota | Fitur | Kebutuhan Fungsional |
|---|---|---|---|
| SRS-11 | 1 | Set budget bulanan | Sistem harus memungkinkan pengguna menetapkan target nominal anggaran (budget) untuk periode bulan tertentu. |
| SRS-12 | 2 | Multi-budget (rekening & kategori) | Sistem harus memungkinkan alokasi anggaran dari berbagai rekening/sumber dana ke dalam pos pengeluaran/kategori spesifik (misal: makanan, transportasi). |
| SRS-13 | 3 | Budget summary | Sistem harus menampilkan ringkasan anggaran bulanan yang memuat total anggaran, akumulasi pengeluaran aktual dari transaksi pada bulan tersebut, dan sisa anggaran. |
| SRS-14 | 3 | Budget indicator | Sistem harus menampilkan indikator visual status pemakaian anggaran (seperti persentase dan penanda status aman atau melebihi anggaran). |
| SRS-15 | 1 | Hak akses mandiri | Sistem harus memastikan setiap pengguna hanya dapat melihat, mengatur, dan memantau data anggaran serta transaksi miliknya sendiri. |

---

## User Stories Sprint Minggu Ini (Modul Budgeting)

### Anggota 1 (Dev 1 - Core Budget & Data Isolation)
- **US-11 (Set Budget Bulanan):** Sebagai pengguna, saya ingin menetapkan target nominal anggaran untuk periode bulan tertentu (misal: melalui halaman `/budgets`) agar pengeluaran dapat terencana dengan baik.
- **US-15 (Hak Akses Mandiri Data Budget):** Sebagai pengguna, saya ingin memastikan seluruh data anggaran dan rencana keuangan saya sepenuhnya privat dan terisolasi, hanya dapat diakses dan diatur oleh akun saya sendiri.

### Anggota 2 (Dev 2 - Multi-Budget Rekening & Kategori)
- **US-12 (Multi-Budget Rekening & Kategori):** Sebagai pengguna, saya ingin mengalokasikan anggaran berdasarkan rekening/sumber dana ke pos kategori pengeluaran spesifik (misal: makanan, transportasi, tagihan) dan memilih kategori saat mencatat transaksi.

### Anggota 3 (Dev 3 - Budget Summary & Visual Indicator)
- **US-13 (Budget Summary):** Sebagai pengguna, saya ingin melihat ringkasan anggaran bulanan yang menyajikan total pagu anggaran, akumulasi pengeluaran aktual pada bulan berjalan, serta sisa anggaran yang masih dapat dibelanjakan.
- **US-14 (Budget Indicator):** Sebagai pengguna, saya ingin melihat indikator visual (persentase penggunaan dan penanda status aman vs waspada vs over-budget) pada dashboard utama dan halaman budget agar mendapat peringatan dini saat pengeluaran mendekati atau melebihi limit.
