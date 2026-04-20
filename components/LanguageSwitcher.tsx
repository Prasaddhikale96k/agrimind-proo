'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', native: 'हिंदी' },
  { code: 'mr', label: 'Marathi', flag: '🇮🇳', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const switchLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <span style={{ fontSize: '18px' }}>{currentLang.flag}</span>
        <span style={{ fontWeight: 600 }}>{currentLang.native}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: '12px', color: '#94a3b8' }}
        >
          ▾
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '200px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '8px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                zIndex: 101,
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px 8px' }}>
                🌐 {t('language.select')}
              </div>

              {LANGUAGES.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  whileHover={{ x: 4, backgroundColor: '#f0fdf4' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: i18n.language === lang.code ? '#f0fdf4' : 'transparent',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{lang.native}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{lang.label}</span>
                  </div>
                  {i18n.language === lang.code && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ color: '#22c55e', fontWeight: 700, fontSize: '14px' }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}