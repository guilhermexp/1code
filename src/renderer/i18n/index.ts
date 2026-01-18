import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import all English translations
import commonEN from './locales/en/common.json'
import sidebarEN from './locales/en/sidebar.json'
import settingsEN from './locales/en/settings.json'
import chatEN from './locales/en/chat.json'
import commandsEN from './locales/en/commands.json'
import onboardingEN from './locales/en/onboarding.json'
import terminalEN from './locales/en/terminal.json'
import previewEN from './locales/en/preview.json'
import diffEN from './locales/en/diff.json'
import changesEN from './locales/en/changes.json'
import toastEN from './locales/en/toast.json'
import validationEN from './locales/en/validation.json'

// Import all Portuguese Brazil translations
import commonPT from './locales/pt-BR/common.json'
import sidebarPT from './locales/pt-BR/sidebar.json'
import settingsPT from './locales/pt-BR/settings.json'
import chatPT from './locales/pt-BR/chat.json'
import commandsPT from './locales/pt-BR/commands.json'
import onboardingPT from './locales/pt-BR/onboarding.json'
import terminalPT from './locales/pt-BR/terminal.json'
import previewPT from './locales/pt-BR/preview.json'
import diffPT from './locales/pt-BR/diff.json'
import changesPT from './locales/pt-BR/changes.json'
import toastPT from './locales/pt-BR/toast.json'
import validationPT from './locales/pt-BR/validation.json'

const resources = {
  en: {
    common: commonEN,
    sidebar: sidebarEN,
    settings: settingsEN,
    chat: chatEN,
    commands: commandsEN,
    onboarding: onboardingEN,
    terminal: terminalEN,
    preview: previewEN,
    diff: diffEN,
    changes: changesEN,
    toast: toastEN,
    validation: validationEN,
  },
  'pt-BR': {
    common: commonPT,
    sidebar: sidebarPT,
    settings: settingsPT,
    chat: chatPT,
    commands: commandsPT,
    onboarding: onboardingPT,
    terminal: terminalPT,
    preview: previewPT,
    diff: diffPT,
    changes: changesPT,
    toast: toastPT,
    validation: validationPT,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',

    // Load all namespaces on init
    ns: [
      'common',
      'sidebar',
      'settings',
      'chat',
      'commands',
      'onboarding',
      'terminal',
      'preview',
      'diff',
      'changes',
      'toast',
      'validation',
    ],

    detection: {
      // Check localStorage first (user preference)
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'preferences:language',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    react: {
      useSuspense: false, // Avoid suspense issues in Electron
    },
  })

export default i18n
