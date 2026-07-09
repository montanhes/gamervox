import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ptBRCommon from './locales/pt-BR/common.json'
import enCommon from './locales/en/common.json'
import esCommon from './locales/es/common.json'
import ruCommon from './locales/ru/common.json'
import zhCNCommon from './locales/zh-CN/common.json'
import jaCommon from './locales/ja/common.json'
import deCommon from './locales/de/common.json'
import frCommon from './locales/fr/common.json'
import koCommon from './locales/ko/common.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { common: ptBRCommon },
      en: { common: enCommon },
      es: { common: esCommon },
      ru: { common: ruCommon },
      'zh-CN': { common: zhCNCommon },
      ja: { common: jaCommon },
      de: { common: deCommon },
      fr: { common: frCommon },
      ko: { common: koCommon },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en', 'es', 'ru', 'zh-CN', 'ja', 'de', 'fr', 'ko'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
