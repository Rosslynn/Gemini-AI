
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '../locales/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.es) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Intentar leer del localStorage o usar el idioma del navegador
  const getInitialLanguage = (): Language => {
    const saved = localStorage.getItem('app_language') as Language;
    if (saved && (saved === 'es' || saved === 'en')) return saved;
    
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'es' ? 'es' : 'en'; // Default a inglés si no es español
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: keyof typeof translations.es): string => {
    const text = translations[language][key];
    return text || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
