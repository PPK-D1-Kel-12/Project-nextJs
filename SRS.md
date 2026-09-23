# SRS Expense Tracker

## Kebutuhan Fungsional

Dokumen ini memuat 10 kebutuhan fungsional aplikasi Expense Tracker berdasarkan pembagian tanggung jawab kedua anggota.

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
