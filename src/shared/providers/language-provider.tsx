'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Locale } from '@/i18n'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  messages: Record<string, any>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function LanguageProvider({ children, initialLocale = 'pt' }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [messages, setMessages] = useState<Record<string, any>>({})

  // Load messages when locale changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messageModule = await import(`../../../messages/${locale}.json`)
        setMessages(messageModule.default)
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    }

    loadMessages()
  }, [locale])

  // Persist locale preference
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('preferred-locale', newLocale)
    document.documentElement.lang = newLocale
  }

  // Load saved locale on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('preferred-locale') as Locale
    if (savedLocale && ['pt', 'en'].includes(savedLocale)) {
      setLocaleState(savedLocale)
    }
  }, [])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, messages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 