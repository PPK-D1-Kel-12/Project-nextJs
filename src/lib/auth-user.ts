import { createClient } from '@/lib/supabase/server';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user && !error) {
      return {
        id: user.id,
        name:
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'Pengguna',
        email: user.email || '',
      };
    }
  } catch {
    // Supabase credentials not set or network issue
  }

  // Fallback demo user untuk kemandirian pengujian Anggota 2
  return {
    id: 'demo-user-bram-001',
    name: 'Bram',
    email: 'bram@example.com',
  };
}
