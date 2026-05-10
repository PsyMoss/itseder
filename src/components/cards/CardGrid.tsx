'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CARDS } from '@/lib/cards-data';
import ServiceCard from './ServiceCard';

export default function CardGrid() {
  const [openCards, setOpenCards] = useState<string[]>([]);
  const [nextCard, setNextCard] = useState<string | null>(CARDS[0]?.id ?? null);
  const scrolling = useRef(false);
  const reachedBottom = useRef(false);
  const lastAutoIndex = useRef(-1); // последний индекс открытый АВТОМАТИЧЕСКИ

  const scrollCardCount = useCallback(() => {
    const scrollTop = window.scrollY;
    const vh = window.innerHeight;
    let count = 0;
    for (let i = 0; i < CARDS.length; i++) {
      const el = document.querySelector(`[data-card-id="${CARDS[i].id}"]`);
      if (!el) break;
      const top = el.getBoundingClientRect().top + scrollTop;
      if (top < scrollTop + vh) count++;
      else break;
    }
    return count;
  }, []);

  const onScroll = useCallback(() => {
    if (scrolling.current) return;

    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH <= 5) return;

    // Вернулись наверх — сбрасываем всё
    if (scrollTop <= 5) {
      reachedBottom.current = false;
      lastAutoIndex.current = -1;
      setOpenCards([]);
      setNextCard(CARDS[0]?.id ?? null);
      return;
    }

    if (reachedBottom.current) return;

    const count = scrollCardCount();
    const newAutoIndex = count - 1;

    // Открываем только новые карточки — не трогаем уже открытые
    if (newAutoIndex > lastAutoIndex.current) {
      lastAutoIndex.current = newAutoIndex;
      setOpenCards(prev => {
        const updated = [...prev];
        for (let i = 0; i <= newAutoIndex; i++) {
          if (!updated.includes(CARDS[i].id)) {
            updated.push(CARDS[i].id);
          }
        }
        return updated;
      });
      setNextCard(CARDS[count]?.id ?? null);
    }

    // Достигли дна — закрываем всё
    const atBottom = scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 5;
    if (atBottom) {
      reachedBottom.current = true;
      lastAutoIndex.current = -1;
      setOpenCards([]);
      setNextCard(null);
    }
  }, [scrollCardCount]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // Ручное открытие/закрытие
  const handleToggle = (id: string) => {
    setOpenCards(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {CARDS.map(card => (
        <ServiceCard
          key={card.id}
          card={card}
          isOpen={openCards.includes(card.id)}
          isNext={nextCard === card.id}
          onToggle={() => handleToggle(card.id)}
          data-card-id={card.id}
        />
      ))}
    </div>
  );
}