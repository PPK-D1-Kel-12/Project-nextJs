import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('[PROJECT-REF]') &&
    !supabaseUrl.includes('placeholder')
  );

  // Cek apakah terdapat sesi demo lokal aktif (untuk pengujian instan / offline)
  const demoCookie = request.cookies.get('demo_auth_session');
  if (demoCookie?.value) {
    let user = null;
    try {
      const parsed = JSON.parse(demoCookie.value);
      user = {
        id: parsed.id || 'demo-user-bram-001',
        email: parsed.email || 'bram@example.com',
        user_metadata: { name: parsed.name || 'Bram' },
      };
    } catch {
      user = {
        id: 'demo-user-bram-001',
        email: 'bram@example.com',
        user_metadata: { name: 'Bram' },
      };
    }
    return { response: supabaseResponse, user };
  }

  if (!isConfigured) {
    return { response: supabaseResponse, user: null };
  }

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Menggunakan timeout 1.5s agar tidak menggantung jika ada kendala jaringan ke Supabase
  let user = null;
  try {
    const userPromise = supabase.auth.getUser().then((res) => res.data?.user || null);
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 1500)
    );
    user = await Promise.race([userPromise, timeoutPromise]);
  } catch {
    user = null;
  }

  return { response: supabaseResponse, user };
}
