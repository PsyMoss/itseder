'use client';

import { useLang } from '@/lib/LangContext';

export default function ContactSection() {
  const { t } = useLang();

  return (
    <section id="contact" className="max-w-2xl mx-auto px-5 pt-6 pb-10" style={{ scrollMarginTop: 70 }}>
      <div className="rounded-2xl p-6 text-center relative overflow-hidden"
        style={{
          border: '1px solid rgba(232,147,30,0.2)',
          background: '#1A1815',
          boxShadow: '0 22px 60px rgba(0,0,0,0.28)',
        }}>

        <p className="text-sm text-center mb-1" style={{ color: '#9A9188' }}>{t.contactTitle}</p>
        <h2 className="text-2xl font-bold text-center mb-3 tracking-tight" style={{ fontFamily: 'Verdana, sans-serif', color: '#DDD5C8' }}>
          Alexey Pavlenko
        </h2>

        {/* Language badges */}
        <div className="flex gap-2 justify-center mb-6">
          {['EN', 'RU', 'HE'].map(l => (
            <span key={l} className="text-xs px-3 py-1 rounded-full"
              style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(20,18,16,0.7)', color: '#9A9188' }}>
              {l}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 relative z-10">

          {/* Phone */}
          <a href="tel:+972525983311"
            className="relative flex items-center justify-center px-14 py-3 rounded-xl text-base transition-all min-h-[52px]"
            style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(36,32,24,0.8)', color: '#DDD5C8' }}>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.1)', color: '#E8931E' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>
              </svg>
            </span>
            <span className="block w-full text-center">052-598-3311</span>
          </a>

          {/* Email */}
          <a href="mailto:info@itseder.com"
            className="relative flex items-center justify-center px-14 py-3 rounded-xl text-base transition-all min-h-[52px]"
            style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(36,32,24,0.8)', color: '#DDD5C8' }}>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: '#1A1815', border: '1px solid rgba(255,255,255,0.1)', color: '#E8931E' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </span>
            <span className="block w-full text-center">info@itseder.com</span>
          </a>

          {/* WhatsApp */}
          <a href={`https://wa.me/972525983311`} target="_blank" rel="noopener"
            className="relative flex items-center justify-center px-14 py-3 rounded-xl text-base transition-all min-h-[52px]"
            style={{ border: '1px solid rgba(37,211,102,0.34)', background: 'rgba(37,211,102,0.055)', color: '#F4F0E8' }}>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(37,211,102,0.62)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg width="15" height="15" fill="rgba(255,255,255,0.86)" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </span>
            <span className="block w-full text-center">{t.waText}</span>
          </a>
        </div>
      </div>
    </section>
  );
}