'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { ReactNode, useEffect } from 'react';

export default function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const applyLanguageSettings = (langCode: string) => {
      document.documentElement.lang = langCode;
      if (['hi', 'mr'].includes(langCode)) {
        document.documentElement.style.fontFamily = "'Noto Sans Devanagari', sans-serif";
      } else if (langCode === 'ta') {
        document.documentElement.style.fontFamily = "'Noto Sans Tamil', sans-serif";
      } else {
        document.documentElement.style.fontFamily = "'Inter', sans-serif";
      }
    };

    applyLanguageSettings(i18n.language);

    i18n.on('languageChanged', applyLanguageSettings);

    return () => {
      i18n.off('languageChanged', applyLanguageSettings);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}