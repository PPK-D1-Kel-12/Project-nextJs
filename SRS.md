# SRS Expense Tracker

## Struktur Tim dan Pembagian Peran

Proyek pengembangan aplikasi Expense Tracker ini dikerjakan oleh tim beranggotakan 4 orang:
- **Project Manager (PM):** Mengawasi keseluruhan jalannya proyek, melakukan code review & QA, koordinasi arsitektur teknis, serta memantau integrasi fitur antar-developer.
- **Anggota 1 (Dev 1 - Autentikasi & Preferensi Pengguna):** Bertanggung jawab atas sistem pendaftaran, otentikasi login/logout, proteksi sesi middleware, serta persistensi preferensi tema via cookie (SRS-01 s/d SRS-04, SRS-06).
- **Anggota 2 (Dev 2 - Transaksi Finansial & Dashboard):** Bertanggung jawab atas modul pencatatan transaksi (CRUD), tabel riwayat & filter, serta ringkasan metrik finansial pada dashboard utama (SRS-05, SRS-07 s/d SRS-10).
- **Anggota 3 (Dev 3 - Budgeting & Pemantauan Anggaran):** Bertanggung jawab atas modul penetapan anggaran bulanan, alokasi multi-budget rekening & kategori, ringkasan realisasi anggaran, indikator visual status anggaran, dan penjaminan hak akses mandiri data anggaran (SRS-11 s/d SRS-15).

---

## Kebutuhan Fungsional

Dokumen ini memuat 15 kebutuhan fungsional aplikasi Expense Tracker yang didistribusikan secara berimbang (masing-masing 5 kebutuhan fungsional) kepada 3 programmer developer:

### 1. Kebutuhan Fungsional Utama

| ID | Anggota | Fitur | Kebutuhan Fungsional |
|---|---|---|---|
| SRS-01 | 1 | Register | Sistem harus memungkinkan pengguna membuat akun menggunakan email unik dan password. |
| SRS-02 | 1 | Login | Sistem harus memvalidasi email dan password, serta memberikan akses aplikasi jika kredensial valid. |
| SRS-03 | 1 | Session | Sistem harus mempertahankan status login selama session aktif dan mewajibkan pengguna login untuk mengakses halaman yang dilindungi. |
| SRS-04 | 1 | Logout | Sistem harus memungkinkan pengguna logout dengan mengakhiri session dan mengarahkan pengguna ke halaman login. |
| SRS-05 | 2 | Dashboard | Sistem harus menampilkan nama pengguna, saldo yang dihitung dari total pemasukan dikurangi total pengeluaran, total pemasukan, total pengeluaran, dan transaksi terbaru milik pengguna yang login. |
| SRS-06 | 1 | Cookie preferensi | Sistem harus memungkinkan pengguna memilih tema terang atau gelap, menyimpan pilihan tersebut dalam cookie, dan menerapkannya kembali saat pengguna membuka aplikasi. |
| SRS-07 | 2 | Tambah transaksi | Sistem harus memungkinkan pengguna mencatat transaksi dengan jenis pemasukan atau pengeluaran, nominal positif, tanggal, dan keterangan, serta menghubungkannya dengan pengguna yang login. |
| SRS-08 | 2 | Riwayat dan filter transaksi | Sistem harus menampilkan riwayat transaksi milik pengguna yang login pada halaman transaksi dan memungkinkan penyaringan berdasarkan jenis transaksi serta rentang tanggal. |
| SRS-09 | 2 | Ubah transaksi | Sistem harus memungkinkan pengguna mengubah transaksi miliknya dan memperbarui ringkasan dashboard sesuai perubahan tersebut. |
| SRS-10 | 2 | Hapus transaksi | Sistem harus memungkinkan pengguna menghapus transaksi miliknya dan memperbarui ringkasan dashboard, serta menolak setiap upaya mengakses, mengubah, atau menghapus transaksi milik pengguna lain. |

### 2. Kebutuhan Fungsional Tambahan: Budget Bulanan

| ID | Anggota | Fitur | Kebutuhan Fungsional |
|---|---|---|---|
| SRS-11 | 3 | Set budget bulanan | Sistem harus memungkinkan pengguna menetapkan target nominal anggaran (budget) untuk periode bulan tertentu. |
| SRS-12 | 3 | Multi-budget (rekening & kategori) | Sistem harus memungkinkan alokasi anggaran dari berbagai rekening/sumber dana ke dalam pos pengeluaran/kategori spesifik (misal: makanan, transportasi). |
| SRS-13 | 3 | Budget summary | Sistem harus menampilkan ringkasan anggaran bulanan yang memuat total anggaran, akumulasi pengeluaran aktual dari transaksi pada bulan tersebut, dan sisa anggaran. |
| SRS-14 | 3 | Budget indicator | Sistem harus menampilkan indikator visual status pemakaian anggaran (seperti persentase dan penanda status aman atau melebihi anggaran). |
| SRS-15 | 3 | Hak akses mandiri | Sistem harus memastikan setiap pengguna hanya dapat melihat, mengatur, dan memantau data anggaran serta transaksi miliknya sendiri. |

---

## User Stories

### Anggota 1 (Auth, Session & Preferences)
- **US-01 (Register):** Sebagai pengguna baru, saya ingin mendaftar dengan email unik dan password agar memiliki akun pribadi untuk mengelola keuangan.
- **US-02 (Login):** Sebagai pengguna terdaftar, saya ingin masuk dengan kredensial saya agar dapat mengakses data keuangan saya secara aman.
- **US-03 (Session):** Sebagai pengguna aktif, saya ingin sesi login saya tetap bertahan selama aktif dan rute yang dilindungi menolak akses tanpa sesi yang valid.
- **US-04 (Logout):** Sebagai pengguna, saya ingin dapat keluar dari aplikasi kapan saja dengan menghapus sesi dan diarahkan kembali ke halaman login.
- **US-06 (Theme Preference):** Sebagai pengguna, saya ingin memilih mode tampilan terang atau gelap yang tersimpan dalam cookie agar preferensi tampilan saya tetap terjaga ketika kembali ke aplikasi.

### Anggota 2 (Transactions & Dashboard)
- **US-05 (Dashboard):** Sebagai pengguna yang telah login, saya ingin melihat ringkasan keuangan utama (nama, saldo bersih, total pemasukan, total pengeluaran, indikator defisit jika saldo minus, serta transaksi terbaru) untuk memahami kondisi keuangan secara cepat.
- **US-07 (Tambah Transaksi):** Sebagai pengguna, saya ingin mencatat pemasukan atau pengeluaran baru dengan nominal bernilai positif, tanggal, dan keterangan transaksi.
- **US-08 (Riwayat & Filter):** Sebagai pengguna, saya ingin melihat riwayat transaksi saya serta menyaringnya berdasarkan tipe transaksi dan rentang tanggal untuk memudahkan evaluasi keuangan.
- **US-09 (Ubah Transaksi):** Sebagai pengguna, saya ingin dapat memperbarui rincian transaksi yang sudah dicatat dan melihat ringkasan saldo dashboard diperbarui secara konsisten.
- **US-10 (Hapus Transaksi & Otorisasi):** Sebagai pengguna, saya ingin dapat menghapus transaksi milik saya dan memastikan bahwa transaksi saya aman dari akses, modifikasi, maupun penghapusan oleh pengguna lain.

### Anggota 3 (Budgeting & Monitoring)
- **US-11 (Set Budget Bulanan):** Sebagai pengguna, saya ingin menetapkan target nominal anggaran untuk periode bulan tertentu agar pengeluaran dapat direncanakan secara terstruktur.
- **US-12 (Multi-Budget Rekening & Kategori):** Sebagai pengguna, saya ingin mengalokasikan pos anggaran ke sumber dana/rekening dan kategori spesifik (contoh: makanan, transportasi, hiburan).
- **US-13 (Budget Summary):** Sebagai pengguna, saya ingin melihat ringkasan yang menyajikan total pagu anggaran, akumulasi pengeluaran aktual pada bulan berjalan, serta sisa anggaran yang masih dapat dibelanjakan.
- **US-14 (Budget Indicator):** Sebagai pengguna, saya ingin melihat indikator visual (persentase penggunaan dan penanda status aman vs over-budget) agar mendapat peringatan dini jika pengeluaran melebihi anggaran.
- **US-15 (Hak Akses Mandiri Data Budget):** Sebagai pengguna, saya ingin menjamin bahwa rencana anggaran, kategori, dan pemantauan pengeluaran saya sepenuhnya privat serta hanya dapat dikelola oleh akun saya sendiri.
