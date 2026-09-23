import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseUrl = Boolean(supabaseUrl);
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const hasSupabaseKey = Boolean(supabaseKey);

  const databaseUrl = process.env.DATABASE_URL;
  const hasDatabaseUrl = Boolean(
    databaseUrl && !databaseUrl.includes('[YOUR-PASSWORD]')
  );

  let supabaseStatus: 'ok' | 'error' | 'not_configured' = 'not_configured';
  let supabaseMessage = '';

  if (hasSupabaseUrl && hasSupabaseKey) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.getSession();
      if (error) {
        supabaseStatus = 'error';
        supabaseMessage = error.message;
      } else {
        supabaseStatus = 'ok';
        supabaseMessage = 'Supabase client berhasil terhubung dan terinisialisasi.';
      }
    } catch (err: unknown) {
      supabaseStatus = 'error';
      supabaseMessage =
        err instanceof Error ? err.message : 'Gagal menginisialisasi Supabase client';
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      supabase: {
        configured: hasSupabaseUrl && hasSupabaseKey,
        url: hasSupabaseUrl ? supabaseUrl : 'belum diset',
        status: supabaseStatus,
        message: supabaseMessage,
      },
      postgres: {
        configured: hasDatabaseUrl,
        hasUrl: Boolean(databaseUrl),
        needsPassword: Boolean(
          databaseUrl && databaseUrl.includes('[YOUR-PASSWORD]')
        ),
        message: hasDatabaseUrl
          ? 'DATABASE_URL siap digunakan.'
          : 'DATABASE_URL belum lengkap (ganti [YOUR-PASSWORD] di .env.local dengan password Postgres Supabase Anda).',
      },
      prisma: {
        configured: true,
        contractSchema: 'prisma/schema.prisma',
        message: 'Prisma ORM contract & singleton client siap digunakan.',
      },
    },
  });
}
