import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ru } from './ru';
import { kk } from './kk';

export type Lang = 'ru' | 'kk';

const translations: Record<Lang, Record<string, string>> = { ru, kk };

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LANG_KEY = 'lifecompass_lang';

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useTranslation = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'kk' || saved === 'ru') return saved;
    } catch {}
    return 'kk';
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'kk' ? 'kk' : 'ru';
  }, [lang]);

  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    let str = translations[lang][key] || translations['ru'][key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
