import { useAtom } from "jotai"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  selectedLanguageAtom,
  AVAILABLE_LANGUAGES,
  type Language,
} from "../../../lib/atoms"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"

// Hook to detect narrow screen
function useIsNarrowScreen(): boolean {
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const checkWidth = () => {
      setIsNarrow(window.innerWidth <= 768)
    }

    checkWidth()
    window.addEventListener("resize", checkWidth)
    return () => window.removeEventListener("resize", checkWidth)
  }, [])

  return isNarrow
}

export function AgentsLanguageTab() {
  const { t } = useTranslation('settings')
  const [selectedLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom)
  const isNarrowScreen = useIsNarrowScreen()

  return (
    <div className="p-6 space-y-6">
      {/* Header - hidden on narrow screens since it's in the navigation bar */}
      {!isNarrowScreen && (
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 className="text-sm font-semibold text-foreground">{t('language.title')}</h3>
          <p className="text-xs text-muted-foreground">
            {t('language.subtitle')}
          </p>
        </div>
      )}

      {/* Language Selection */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="flex items-start justify-between p-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-foreground">
              {t('language.applicationLanguage')}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('language.selectLanguage')}
            </span>
          </div>

          <Select
            value={selectedLanguage}
            onValueChange={(value: Language) => setSelectedLanguage(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Info note */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-xs text-muted-foreground">
          {t('language.changeNote')}
        </p>
      </div>
    </div>
  )
}
