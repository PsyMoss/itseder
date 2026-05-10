'use client';

import { useLang } from '@/lib/LangContext';
import CardGrid from './cards/CardGrid';

export default function ServicesSection() {
  const { t, dir } = useLang();

  return (
    <section id="services" className="max-w-2xl mx-auto px-5 py-8">
      <p
        className="text-xs tracking-widest uppercase mb-1 font-medium"
        style={{ color: '#E8931E', textAlign: dir === 'rtl' ? 'right' : 'left' }}
      >

      </p>
      <h2
        className="text-2xl font-bold text-[#DDD5C8] mb-5 tracking-tight"
        style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}
      >
        {t.servicesTitle}
      </h2>
      <CardGrid />
    </section>
  );
}