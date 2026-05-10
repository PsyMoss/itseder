'use client';

import { useState, useRef, useEffect } from 'react';
import { useLang } from '@/lib/LangContext';
import { ServiceCard as ServiceCardType } from '@/lib/cards-data';

const COLORS = {
  acc:  { border: 'rgba(232,147,30,0.6)',  tag: '#E8931E', bg: 'rgba(232,147,30,0.08)'  },
  acc2: { border: 'rgba(74,158,122,0.6)',  tag: '#4A9E7A', bg: 'rgba(74,158,122,0.08)'  },
  acc3: { border: 'rgba(122,142,232,0.6)', tag: '#7A8EE8', bg: 'rgba(122,142,232,0.08)' },
};

interface Props {
  card: ServiceCardType;
  isOpen: boolean;
  isNext: boolean;
  onToggle: () => void;
}

export default function ServiceCard({ card, isOpen, isNext, onToggle }: Props) {
  const { lang, dir } = useLang();
  const color = COLORS[card.color ?? 'acc'];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setVideoError(false);
    }
  }, [card.id]);

  const borderColor = isOpen ? color.border : isNext ? 'rgba(232,147,30,0.2)' : 'rgba(255,255,255,0.08)';

  return (
    <div
      id={`card-${card.id}`}
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ border: `1px solid ${borderColor}`, background: '#141210' }}
    >
      {/* Header — video or image + text overlay */}
      <div
        className="relative cursor-pointer overflow-hidden"
        style={{ minHeight: 120 }}
        onClick={onToggle}
      >
{/* Video — primary */}
{card.video && !videoError && (
  <video
    ref={videoRef}
    className="absolute inset-0 w-full h-full object-cover"
    autoPlay loop muted playsInline
    onError={() => setVideoError(true)}
  >
    <source src={card.video} type="video/mp4" />
  </video>
)}

{/* Image — fallback when no video or video failed */}
{(!card.video || videoError) && card.image && (
  <img
    src={card.image}
    alt={card.h[lang]}
    className="absolute inset-0 w-full h-full object-cover"
    onError={(e) => {
      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${card.id}/400/200`;
    }}
  />
)}

        {/* Gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to right, rgba(15,14,12,0) 0%, rgba(15,14,12,0.7) 40%, rgba(15,14,12,0.99) 60%)'
        }} />

        {/* Text overlay */}
        <div
          className="relative z-10 flex items-center gap-3 px-5 py-5 w-full"
          style={{ flexDirection: dir === 'rtl' ? 'row-reverse' : 'row', justifyContent: 'space-between' }}
        >
          <div style={{ textAlign: dir === 'rtl' ? 'right' : 'left', flex: 1 }}>
            <span
              className="inline-block text-xs font-semibold tracking-wide uppercase pb-1 mb-2"
              style={{ color: color.tag, borderBottom: `1px solid ${color.tag}66` }}
            >
              {card.tag[lang]}
            </span>
            <div className="text-xl font-bold text-white">{card.h[lang]}</div>
          </div>

          {/* Arrow */}
          <svg
            className="flex-shrink-0 transition-transform duration-500"
            style={{
              width: 20, height: 20,
              color: color.tag,
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Body — accordion */}
      <div
        className="overflow-hidden transition-all duration-500"
        style={{ maxHeight: isOpen ? 600 : 0, opacity: isOpen ? 1 : 0 }}
      >
        <div className="px-5 pb-6 pt-2" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
          <p className="text-lg leading-relaxed mb-5" style={{ color: '#C4BAB0' }}>
            {card.p[lang]}
          </p>

          {/* List */}
          {card.li && (
            <ul className="flex flex-col gap-3">
              {card.li.map((item, i) => (
                <li key={i} className="text-base leading-relaxed" style={{ color: '#C4BAB0' }}>
                  {dir === 'rtl' ? `• ${item[lang]}` : `→ ${item[lang]}`}
                </li>
              ))}
            </ul>
          )}

          {/* Grid */}
          {card.grid && (
            <div className="flex flex-col gap-3">
              {card.grid.map((item, i) => (
                <div key={i} className="rounded-xl p-4"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#1C1916' }}>
                  <div className="text-base font-bold text-white mb-1">{item[lang][0]}</div>
                  <div className="text-sm" style={{ color: '#C4BAB0' }}>{item[lang][1]}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}