'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/prisma';

export interface AuthActionState {
  error?: string | null;
  success?: string | null;
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // 1. Validasi Input
  if (!name || !email || !password || !confirmPassword) {
    return { error: 'Semua kolom wajib diisi.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Format email tidak valid.' };
  }

  if (password.length < 6) {
    return { error: 'Password minimal harus 6 karakter.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Konfirmasi password tidak cocok.' };
  }

  // 2. Daftar ke Supabase Auth
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' };
    }
    return { error: error.message };
  }

  const user = data.user;
  if (!user) {
    return { error: 'Gagal membuat akun. Silakan coba kembali.' };
  }

  // 3. Sinkronisasi ke PostgreSQL via Prisma (jika database sudah terhubung)
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.includes('[YOUR-PASSWORD]')) {
      await db.orm.public.User.create({
        id: user.id,
        email: user.email ?? email,
        name,
      });
    }
  } catch (dbError) {
    // Log peringatan tanpa menggagalkan registrasi pengguna jika DB belum siap
    console.warn('Peringatan sinkronisasi Prisma User:', dbError);
  }

  // 4. Auto-Login (Opsi A)
  // Jika session langsung tersedia (confirm email off):
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/dashboard');
  }

  // Jika Supabase mengharuskan verifikasi email:
  // Coba login otomatis sekali lagi
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError) {
    revalidatePath('/', 'layout');
    redirect('/dashboard');
  }

  return {
    success:
      'Registrasi berhasil! Tautan verifikasi telah dikirim ke email Anda. Silakan verifikasi untuk melanjutkan.',
  };
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirectTo') as string)?.trim() || '/dashboard';

  // 1. Validasi Input
  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' };
  }

  // 2. Login ke Supabase Auth
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (
      error.message.toLowerCase().includes('invalid login credentials') ||
      error.message.toLowerCase().includes('invalid credentials')
    ) {
      return { error: 'Email atau password yang Anda masukkan salah.' };
    }
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        error:
          'Email Anda belum diverifikasi. Silakan periksa inbox/spam email Anda.',
      };
    }
    return { error: error.message };
  }

  // 3. Revalidate dan Redirect ke Halaman Tujuan
  revalidatePath('/', 'layout');
  redirect(redirectTo.startsWith('/') ? redirectTo : '/dashboard');
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
