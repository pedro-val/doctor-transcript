'use client'

import { Languages, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/shared/providers/language-provider'
import { useTranslations } from '@/shared/hooks/use-translations'
import { useState, useRef, useEffect } from 'react'

// Ícone da Bandeira do Brasil
const BrazilFlag = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="16" fill="#009B3A" rx="2" />
    <path
      d="M12 2L22 8L12 14L2 8L12 2Z"
      fill="#FFDF00"
    />
    <circle cx="12" cy="8" r="3.5" fill="#002776" />
    <path
      d="M9 7.5C9 7.5 10.5 6.5 12 7.5C13.5 6.5 15 7.5 15 7.5"
      stroke="#FFDF00"
      strokeWidth="0.5"
      fill="none"
    />
  </svg>
)

// Ícone da Bandeira dos Estados Unidos
const USAFlag = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="16" fill="#B22234" rx="2" />
    <rect x="0" y="1" width="24" height="1" fill="white" />
    <rect x="0" y="3" width="24" height="1" fill="white" />
    <rect x="0" y="5" width="24" height="1" fill="white" />
    <rect x="0" y="7" width="24" height="1" fill="white" />
    <rect x="0" y="9" width="24" height="1" fill="white" />
    <rect x="0" y="11" width="24" height="1" fill="white" />
    <rect x="0" y="13" width="24" height="1" fill="white" />
    <rect x="0" y="15" width="24" height="1" fill="white" />
    <rect x="0" y="0" width="10" height="8" fill="#3C3B6E" />
    <g fill="white">
      <circle cx="1.5" cy="1" r="0.3" />
      <circle cx="3" cy="1" r="0.3" />
      <circle cx="4.5" cy="1" r="0.3" />
      <circle cx="6" cy="1" r="0.3" />
      <circle cx="7.5" cy="1" r="0.3" />
      <circle cx="9" cy="1" r="0.3" />
      <circle cx="2.25" cy="2" r="0.3" />
      <circle cx="3.75" cy="2" r="0.3" />
      <circle cx="5.25" cy="2" r="0.3" />
      <circle cx="6.75" cy="2" r="0.3" />
      <circle cx="8.25" cy="2" r="0.3" />
      <circle cx="1.5" cy="3" r="0.3" />
      <circle cx="3" cy="3" r="0.3" />
      <circle cx="4.5" cy="3" r="0.3" />
      <circle cx="6" cy="3" r="0.3" />
      <circle cx="7.5" cy="3" r="0.3" />
      <circle cx="9" cy="3" r="0.3" />
    </g>
  </svg>
)

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage()
  const { t } = useTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { 
      code: 'pt' as const, 
      name: t('language.portuguese'), 
      flagIcon: BrazilFlag,
      nativeName: 'Português'
    },
    { 
      code: 'en' as const, 
      name: t('language.english'), 
      flagIcon: USAFlag,
      nativeName: 'English'
    }
  ]

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (langCode: 'pt' | 'en') => {
    setLocale(langCode)
    setIsOpen(false)
  }

  return (
    <div className="fixed top-2 right-12 sm:top-4 sm:right-20 z-50" ref={dropdownRef}>
      <div className="relative">
        {/* Main Button */}
        <Button
          variant="outline" 
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-1 sm:gap-2 bg-background/80 backdrop-blur-sm border-2 hover:bg-background/90 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-10"
          aria-label={t('language.toggle')}
          title={t('language.toggle')}
        >
          <currentLanguage.flagIcon className="w-4 h-3 sm:w-5 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium hidden xs:inline sm:inline">
            {currentLanguage.nativeName}
          </span>
          <span className="text-xs sm:text-sm font-medium xs:hidden sm:hidden">
            {currentLanguage.code.toUpperCase()}
          </span>
          <Languages className="h-3 w-3 opacity-70" />
        </Button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full mt-2 right-0 bg-background border border-border rounded-lg shadow-lg p-1 min-w-[160px] sm:min-w-[180px] animate-in slide-in-from-top-2 duration-200">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 text-sm rounded-md transition-colors text-left
                  ${locale === language.code 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted text-foreground'
                  }
                `}
              >
                {/* Flag Icon Container */}
                <div className={`
                  flex items-center justify-center w-8 h-6 rounded-sm border flex-shrink-0 overflow-hidden
                  ${locale === language.code 
                    ? 'border-primary-foreground/20 bg-primary-foreground/10' 
                    : 'border-border bg-muted/50'
                  }
                `}>
                  <language.flagIcon className="w-full h-full object-cover" />
                </div>
                
                {/* Language Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{language.nativeName}</div>
                  <div className={`text-xs truncate ${locale === language.code ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {language.name}
                  </div>
                </div>
                
                {/* Check Icon */}
                {locale === language.code && (
                  <Check className="h-4 w-4 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 