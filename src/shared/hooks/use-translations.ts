'use client'

import { useLanguage } from '@/shared/providers/language-provider'
import { useCallback, useMemo } from 'react'

type MessagePath = string
type MessageValues = Record<string, string | number>

export function useTranslations() {
  const { messages } = useLanguage()

  const t = useCallback((path: MessagePath, values?: MessageValues): string => {
    const keys = path.split('.')
    let result: any = messages
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key]
      } else {
        // Return path as fallback if translation not found
        return path
      }
    }

    if (typeof result !== 'string') {
      return path
    }

    // Replace placeholders with values
    if (values) {
      return result.replace(/\{(\w+)\}/g, (match, key) => {
        return values[key]?.toString() || match
      })
    }

    return result
  }, [messages])

  return useMemo(() => ({ t }), [t])
} 