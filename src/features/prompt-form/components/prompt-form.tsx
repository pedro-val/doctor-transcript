'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ReportFormData } from '@/entities'

const promptSchema = z.object({
  prompt: z.string()
    .min(20, 'O prompt deve ter pelo menos 20 caracteres para ser efetivo')
})

interface PromptFormProps {
  onSubmit: (data: ReportFormData) => void
  isLoading?: boolean
  showSubmitButton?: boolean
  className?: string
}

const defaultPrompt = `Você é um assistente inteligente. Analise o conteúdo fornecido e responda de acordo com as instruções específicas que você receber.

Mantenha-se fiel ao conteúdo original e siga exatamente as diretrizes que forem dadas.`

export function PromptForm({ onSubmit, isLoading = false, showSubmitButton = true, className }: PromptFormProps) {
  const initializedRef = useRef(false)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<ReportFormData>({
    resolver: zodResolver(promptSchema),
    mode: 'onChange',
    defaultValues: {
      prompt: defaultPrompt
    }
  })

  const currentPrompt = watch('prompt')

  // Chama onSubmit automaticamente uma vez na inicialização se não há botão de submit
  useEffect(() => {
    if (!showSubmitButton && !initializedRef.current) {
      const timeoutId = setTimeout(() => {
        if (isValid && currentPrompt) {
          onSubmit({ prompt: currentPrompt })
        }
        initializedRef.current = true
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [showSubmitButton, isValid, currentPrompt, onSubmit])

  // Chama onSubmit quando dados mudam (apenas após inicialização)
  useEffect(() => {
    if (!showSubmitButton && initializedRef.current && isValid && currentPrompt) {
      onSubmit({ prompt: currentPrompt })
    }
  }, [currentPrompt, showSubmitButton, isValid, onSubmit])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Instruções
        </CardTitle>
        <CardDescription>
          Configure como a IA deve analisar e processar o conteúdo do áudio
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dicas */}
        <div className="bg-muted/50 p-4 rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>💡 Dicas para melhores resultados:</strong>
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li><strong>Personalidade:</strong> Defina quem é a IA (assistente, especialista, analista, etc.)</li>
            <li><strong>Instruções:</strong> Seja específico sobre o que você quer que seja feito</li>
            <li><strong>Formato:</strong> Especifique como quer a resposta (lista, tabela, narrativa, etc.)</li>
            <li><strong>Estilo:</strong> Defina o tom (formal, casual, técnico, criativo, etc.)</li>
          </ul>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Prompt Completo (Personalidade + Instruções):
            </label>
            <Textarea
              id="prompt"
              placeholder="Defina a personalidade da IA e as instruções específicas sobre como processar o conteúdo..."
              className="min-h-[400px] w-full resize-y break-words whitespace-pre-wrap overflow-auto"
              {...register('prompt')}
            />
            {errors.prompt && (
              <p className="text-sm text-destructive">{errors.prompt.message}</p>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {currentPrompt?.length || 0} caracteres
              </span>
              <span>
                Mínimo: 20 caracteres
              </span>
            </div>
          </div>

          {showSubmitButton && (
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Configurar Prompt
                </>
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
} 