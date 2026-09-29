import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        redirect('/dashboard');
      } else {
        redirect('/login');
      }
    } catch {
      redirect('/dashboard');
    }
  }

  redirect('/dashboard');
}
