'use client';
import { useLang } from '@/lib/LangContext';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="text-center py-5 text-xs border-t px-5"
      style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#9A9188' }}>
      {t.foot}
    </footer>
  );
}