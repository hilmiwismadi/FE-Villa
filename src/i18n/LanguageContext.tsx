import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { id as idLocale, enUS } from 'date-fns/locale';
import type { Language, Translations } from './types.ts';
import idTranslations from './locales/id.json';
import enTranslations from './locales/en.json';

interface LanguageContextType {
  lang: Language;
  t: Translations;
  dateFnsLocale: typeof idLocale;
  localePath: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const lang: Language = pathname.startsWith('/en') ? 'en' : 'id';

  const value = useMemo<LanguageContextType>(() => ({
    lang,
    t: (lang === 'en' ? enTranslations : idTranslations) as Translations,
    dateFnsLocale: lang === 'en' ? enUS : idLocale,
    localePath: (path: string) => lang === 'en' ? `/en${path}` : path,
  }), [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
