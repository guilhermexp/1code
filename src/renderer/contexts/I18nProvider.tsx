import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import { useAtom } from 'jotai'
import i18n from '../i18n'
import { selectedLanguageAtom, type Language } from '../lib/atoms'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [selectedLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom)

  // Sync i18next language with Jotai atom
  useEffect(() => {
    const currentLang = i18n.language

    // If i18next detected a different language, update atom
    if (currentLang !== selectedLanguage) {
      setSelectedLanguage(currentLang as Language)
    }
  }, [])

  // Listen to atom changes and update i18next
  useEffect(() => {
    if (i18n.language !== selectedLanguage) {
      i18n.changeLanguage(selectedLanguage)
    }
  }, [selectedLanguage])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
