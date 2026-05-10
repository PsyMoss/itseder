'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { T, Lang, Translation } from '@/lib/translations';

interface LangContextType {
  lang: Lang;
  t: Translation;
  dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'he',
  t: T.he,
  dir: 'rtl',
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('he');

  const setLang = (l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    document.documentElement.dir = T[l].dir;
  };

  return (
    <LangContext.Provider value={{ lang, t: T[lang], dir: T[lang].dir, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);