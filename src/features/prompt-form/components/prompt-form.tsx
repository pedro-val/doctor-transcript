'use client'

import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ReportFormData } from '@/entities'
import { useTranslations } from '@/shared/hooks/use-translations'
import { useLanguage } from '@/shared/providers/language-provider'

interface PromptFormProps {
  onSubmit: (data: ReportFormData) => void
  isLoading?: boolean
  showSubmitButton?: boolean
  className?: string
}

export function PromptForm({ onSubmit, isLoading = false, showSubmitButton = true, className }: PromptFormProps) {
  const { t } = useTranslations()
  const { locale } = useLanguage()
  const initializedRef = useRef(false)
  
  const promptSchema = useMemo(() => z.object({
    prompt: z.string()
      .min(20, t('prompt.min_chars'))
  }), [t])

  const defaultPrompt = useMemo(() => t('prompt.default'), [t])
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<ReportFormData>({
    resolver: zodResolver(promptSchema),
    mode: 'onChange',
    defaultValues: {
      prompt: ''
    }
  })

  const currentPrompt = watch('prompt')

  // Update form when locale changes - if field is empty, keep it empty to show placeholder
  useEffect(() => {
    if (!currentPrompt.trim()) {
      setValue('prompt', '', { shouldValidate: false })
    }
  }, [locale, setValue, currentPrompt])

  // Stable callback for onSubmit
  const stableOnSubmit = useCallback((promptToUse: string) => {
    if (promptToUse.length >= 20) {
      onSubmit({ prompt: promptToUse })
    }
  }, [onSubmit])

  // Chama onSubmit automaticamente uma vez na inicialização se não há botão de submit
  useEffect(() => {
    if (!showSubmitButton && !initializedRef.current) {
      const timeoutId = setTimeout(() => {
        // Só chama se o prompt atual tem pelo menos 20 caracteres
        if (currentPrompt.trim().length >= 20) {
          stableOnSubmit(currentPrompt.trim())
          initializedRef.current = true
        }
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [showSubmitButton, currentPrompt, stableOnSubmit])

  // Chama onSubmit quando dados mudam (apenas após inicialização)
  useEffect(() => {
    if (!showSubmitButton && initializedRef.current) {
      // Só chama se o prompt atual tem pelo menos 20 caracteres
      if (currentPrompt.trim().length >= 20) {
        stableOnSubmit(currentPrompt.trim())
      }
    }
  }, [currentPrompt, showSubmitButton, stableOnSubmit])

  const handleFormSubmit = useCallback((data: ReportFormData) => {
    // Se o prompt está vazio, usa o padrão
    const promptToUse = data.prompt.trim() || defaultPrompt
    onSubmit({ prompt: promptToUse })
  }, [onSubmit, defaultPrompt])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('prompt.title')}
        </CardTitle>
        <CardDescription>
          {t('prompt.description')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dicas */}
        <div className="bg-muted/50 p-4 rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>{t('prompt.tips_title')}</strong>
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li><strong>{t('prompt.tip_personality')}</strong> {t('prompt.tip_personality_desc')}</li>
            <li><strong>{t('prompt.tip_instructions')}</strong> {t('prompt.tip_instructions_desc')}</li>
            <li><strong>{t('prompt.tip_format')}</strong> {t('prompt.tip_format_desc')}</li>
            <li><strong>{t('prompt.tip_style')}</strong> {t('prompt.tip_style_desc')}</li>
          </ul>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              {t('prompt.label')}
            </label>
            <Textarea
              id="prompt"
              placeholder={defaultPrompt}
              className="min-h-[400px] w-full resize-y break-words whitespace-pre-wrap overflow-auto"
              {...register('prompt')}
            />
            {errors.prompt && (
              <p className="text-sm text-destructive">{errors.prompt.message}</p>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {t('prompt.characters', { count: currentPrompt?.length || 0 })}
              </span>
              <span>
                {t('prompt.minimum')}
              </span>
            </div>

          </div>

          {showSubmitButton && (
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {t('prompt.processing')}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t('prompt.configure')}
                </>
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
} 