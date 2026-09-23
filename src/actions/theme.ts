'use server';

import { cookies } from 'next/headers';

export type AppTheme = 'light' | 'dark';

export async function getTheme(): Promise<AppTheme> {
  const cookieStore = await cookies();
  const theme = cookieStore.get('app_theme')?.value;
  return theme === 'dark' ? 'dark' : 'light';
}

export async function setTheme(theme: AppTheme): Promise<{ success: boolean; theme: AppTheme }> {
  const cookieStore = await cookies();
  cookieStore.set('app_theme', theme, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 tahun
    sameSite: 'lax',
  });
  return { success: true, theme };
}

export async function toggleTheme(): Promise<{ success: boolean; theme: AppTheme }> {
  const cookieStore = await cookies();
  const current = cookieStore.get('app_theme')?.value;
  const nextTheme: AppTheme = current === 'dark' ? 'light' : 'dark';
  cookieStore.set('app_theme', nextTheme, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return { success: true, theme: nextTheme };
}
