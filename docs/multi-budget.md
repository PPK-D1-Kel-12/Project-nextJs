# Multi-budget (SRS-12)

Buka `/budgets` dari menu **Anggaran**. Tambahkan rekening/sumber dana
(misalnya BCA, Tunai, GoPay), tambahkan kategori (Makanan, Transportasi),
pilih periode bulan, lalu buat alokasi. Satu rekening dapat membiayai banyak
kategori dan satu kategori dapat menerima alokasi dari beberapa rekening.
Kombinasi rekening + kategori + bulan tidak boleh duplikat; gunakan **Ubah**
untuk mengganti nominal. Rekening/kategori yang masih digunakan tidak dapat
dihapus sebelum seluruh alokasinya dihapus, termasuk alokasi bulan lain.

Nominal adalah rupiah bulat positif, maksimal Rp1.000.000.000.000 per alokasi.
Ringkasan menunjukkan rencana alokasi, bukan saldo rekening atau realisasi
pengeluaran. Fitur ini tidak mencatat transfer atau mengurangi saldo transaksi.

## Persiapan database

1. Isi `.env.local` dengan `NEXT_PUBLIC_SUPABASE_URL` dan salah satu dari
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. Terapkan `supabase/migrations/202609300001_multi_budget.sql` pada proyek
   Supabase yang sama melalui SQL Editor atau alur migrasi Supabase.
3. Restart server dan masuk dengan akun Supabase yang sebenarnya.

Modul ini menggunakan klien Supabase yang sudah tersedia dalam aplikasi untuk
menyimpan data permanen. Tiga tabel `budget_*` dikelola oleh migrasi SQL di atas,
bukan kontrak Prisma transaksi. Jangan menghapus tabel tersebut saat menyelaraskan
schema Prisma. Tidak ada fallback penyimpanan memori untuk data anggaran.
Mode demo login yang sudah ada di proyek tidak memberikan akses ke data ini.

Setiap server action memverifikasi pengguna lewat Supabase Auth. RLS membatasi
baca/tulis berdasarkan `auth.uid()`, sedangkan foreign key gabungan memastikan
rekening dan kategori alokasi dimiliki pengguna yang sama. Constraint unik
mencegah duplikasi, termasuk ketika permintaan berjalan bersamaan.

## Verifikasi

Jalankan `npm test -- src/actions/__tests__/budgets.test.ts` untuk validasi input,
rekap multi-rekening, pembatasan pemilik dalam query, serta penanganan kegagalan.
Pengujian action menggunakan mock; constraint SQL/RLS perlu diuji pada Supabase:

- Buat dua akun pengguna, pastikan akun B tidak bisa membaca/mengubah data A.
- Coba buat alokasi dengan rekening/kategori milik pengguna lain: harus ditolak.
- Alokasikan BCA → Makanan Rp500.000 dan Tunai → Makanan Rp200.000:
  total kategori harus Rp700.000.
- Ganti bulan: alokasi bulan sebelumnya tidak muncul. Refresh halaman dan
  restart server: data tetap tersimpan.
- Ubah/hapus alokasi: rekap harus mengikuti. Buat duplikat dan hapus rekening
  yang dipakai oleh alokasi: tampilkan pesan kegagalan.
