'use client';

import Nav from '@/components/Nav';
import ServicesSection from '@/components/ServicesSection';
import { useLang } from '@/lib/LangContext';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

export default function Home() {
  const { t, dir } = useLang();

  return (
    <main className="min-h-screen" dir={dir}>
      <Nav />

      {/* HERO */}
      <section className="max-w-2xl mx-auto px-5 pt-12 pb-8 text-center">
        <h1 className="text-4xl font-bold leading-tight mb-4 text-[#DDD5C8]">
          {t.h1}{' '}
          <em className="not-italic" style={{ color: '#E8931E' }}>{t.h1accent}</em>
        </h1>
        <p className="text-base text-[#9A9188] leading-relaxed mb-8">{t.hsub}</p>
        <div className="flex gap-3 justify-center">
          <button
            className="px-7 py-3.5 rounded-xl text-base font-semibold transition-opacity hover:opacity-85 min-h-[50px]"
            style={{ background: '#E8931E', color: '#0A0908' }}>
            {t.b1}
          </button>
        </div>
      </section>

      <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0 20px' }} />

      <ServicesSection />

      <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0 20px' }} />
<ContactSection />
<Footer />

    </main>
  );
}