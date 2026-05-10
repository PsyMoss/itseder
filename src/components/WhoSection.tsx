'use client';

import { useLang } from '@/lib/LangContext';

const TAG_ANCHORS: Record<string, string> = {
  // HE
  'משרדי עורכי דין': 'office',
  'חברות פיננסיות': 'remote',
  'חברות ביטוח': 'remote',
  'סטודיו ומוזיקאים': 'studio',
  'מעצבים גרפיים': 'studio',
  'עסקים קטנים': 'pc',
  // RU
  'Адвокатские конторы': 'office',
  'Финансовые компании': 'remote',
  'Страховые компании': 'remote',
  'Студии и музыканты': 'studio',
  'Графические дизайнеры': 'studio',
  'Малый бизнес': 'pc',
  // EN
  'Law firms': 'office',
  'Financial companies': 'remote',
  'Insurance agencies': 'remote',
  'Studio & Musicians': 'studio',
  'Graphic designers': 'studio',
  'Small business': 'pc',
};

export default function WhoSection() {
  const { t } = useLang();

  const scrollToCard = (cardId: string) => {
    const el = document.getElementById('card-' + cardId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offset = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  };

  return (
    <div className="max-w-2xl mx-auto px-5 pb-6">
      {/* Divider with label */}
      <div className="flex items-center gap-3 mb-4 justify-center">
        <div className="flex-1 max-w-[80px] h-px" style={{ background: 'rgba(232,147,30,0.35)' }} />
        <p className="text-sm font-medium" style={{ color: '#C4BAB0' }}>{t.whoP}</p>
        <div className="flex-1 max-w-[80px] h-px" style={{ background: 'rgba(232,147,30,0.35)' }} />
      </div>

      {/* Tags grid */}
      <div className="grid grid-cols-2 gap-2">
        {t.who.map((tag) => {
          const anchor = TAG_ANCHORS[tag];
          return (
            <button
              key={tag}
              onClick={() => anchor && scrollToCard(anchor)}
              className="py-3 px-3 rounded-xl text-base font-medium text-center transition-all duration-200"
              style={{
                border: `1px solid ${anchor ? 'rgba(232,147,30,0.2)' : 'rgba(255,255,255,0.08)'}`,
                background: '#1C1916',
                color: '#C4BAB0',
                cursor: anchor ? 'pointer' : 'default',
              }}
              onMouseEnter={e => {
                if (anchor) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(232,147,30,0.6)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#E8931E';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = anchor ? 'rgba(232,147,30,0.2)' : 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLButtonElement).style.color = '#C4BAB0';
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}