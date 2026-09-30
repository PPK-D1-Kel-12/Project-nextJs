import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  try {
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get('demo_auth_session');
    if (demoCookie?.value) {
      try {
        const parsed = JSON.parse(demoCookie.value);
        return {
          id: parsed.id || 'demo-user-bram-001',
          name: parsed.name || 'Bram',
          email: parsed.email || 'bram@example.com',
        };
      } catch {
        // ignore parse error
      }
    }
  } catch {
    // cookies error
  }

  try {
    const supabase = await createClient();
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null }; error: null }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null }, error: null }), 1500)
    );
    const {
      data: { user },
      error,
    } = await Promise.race([userPromise, timeoutPromise]);

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
