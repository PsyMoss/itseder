'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PortalLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/portal');
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) router.push('/portal');
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/portal/login`,
      },
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0908' }}>
      <div className="text-[#9A9188]">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0908' }}>
      <div className="rounded-2xl p-8 w-full max-w-sm text-center"
        style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.08)' }}>

        <div className="font-bold text-3xl mb-2" style={{ fontFamily: 'Verdana, sans-serif', color: '#DDD5C8' }}>
          IT<span style={{ color: '#E8931E' }}>Seder</span>
        </div>
        <p className="text-sm mb-2" style={{ color: '#9A9188' }}>Client Portal</p>
        <p className="text-xs mb-8 px-4" style={{ color: '#9A9188' }}>
          Sign in to view your devices, invoices and support history
        </p>

        <button onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all hover:opacity-90 mb-3"
          style={{ background: '#fff', color: '#111' }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <a href="/" className="text-xs" style={{ color: '#9A9188' }}>← Back to site</a>
      </div>
    </div>
  );
}