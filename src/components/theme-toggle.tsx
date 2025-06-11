'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/shared/providers/theme-provider'
import { useTranslations } from '@/shared/hooks/use-translations'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslations()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant="outline" 
      size="icon"
      onClick={toggleTheme}
      className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 bg-background/80 backdrop-blur-sm border-2 hover:bg-background/90 transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
      aria-label={t('theme.toggle')}
      title={t('theme.toggle')}
    >
      <Sun className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
} 