'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/LangContext';
import { Lang } from '@/lib/translations';
import { supabase } from '@/lib/supabase';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'he', label: 'עב' },
];

const ADMIN_EMAIL = 'alexypv@gmail.com';

export default function Nav() {
  const { lang, setLang } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const router = useRouter();

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser({ email: session.user.email! });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? { email: session.user.email! } : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleLangClick = (code: Lang) => {
    if (code === lang) {
      setLangOpen(prev => !prev);
    } else {
      setLang(code);
      setLangOpen(false);
    }
  };

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 border-b border-white/8 backdrop-blur-lg"
      style={{ background: 'rgba(8,10,13,0.95)' }}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('.lang-group')) setLangOpen(false);
      }}
    >
      {/* Logo */}
      <div
        className="font-bold text-xl cursor-pointer tracking-tight"
        style={{ fontFamily: 'Verdana, sans-serif', color: '#DDD5C8' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        IT<span style={{ color: '#E8931E' }}>Seder</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Admin button — только для alexypv@gmail.com */}
        {isAdmin && (
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
            style={{
              border: '1px solid rgba(122,142,232,0.4)',
              color: '#7A8EE8',
              background: 'rgba(122,142,232,0.08)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(122,142,232,0.18)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(122,142,232,0.7)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(122,142,232,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(122,142,232,0.4)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2z"/>
              <path d="M3 21c0-4 4-7 9-7s9 3 9 7"/>
            </svg>
            Admin
          </button>
        )}

        {/* Portal button */}
        {user ? (
          <button
            onClick={() => router.push('/portal')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
            style={{
              border: '1px solid rgba(74,158,122,0.4)',
              color: '#4A9E7A',
              background: 'rgba(74,158,122,0.08)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(74,158,122,0.18)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,158,122,0.7)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(74,158,122,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,158,122,0.4)';
            }}
          >
            <span style={{ fontSize: '8px' }}>⬤</span>
            Portal
          </button>
        ) : (
          <button
            onClick={() => router.push('/portal/login')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9A9188' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,147,30,0.4)';
              (e.currentTarget as HTMLElement).style.color = '#E8931E';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
              (e.currentTarget as HTMLElement).style.color = '#9A9188';
            }}
          >
            Sign In
          </button>
        )}

        {/* Phone button */}
        <button
          onClick={scrollToContact}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
          style={{ border: '1px solid rgba(232,147,30,0.5)', background: 'rgba(232,147,30,0.1)', color: '#E8931E' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </button>

        {/* Language buttons */}
        <div className="lang-group flex gap-1">
          {LANGS.map(({ code, label }) => {
            const isActive = lang === code;
            const isVisible = isActive || langOpen;
            return (
              <button
                key={code}
                onClick={() => handleLangClick(code)}
                className="px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 min-h-[36px] uppercase"
                style={{
                  display: isVisible ? 'flex' : 'none',
                  alignItems: 'center',
                  border: isActive ? '1px solid #E8931E' : '1px solid rgba(255,255,255,0.1)',
                  color: isActive ? '#E8931E' : '#9A9188',
                  background: isActive ? 'rgba(232,147,30,0.1)' : 'transparent',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}