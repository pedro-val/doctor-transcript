'use client'

import { useState, useCallback } from 'react'
import { Stethoscope, Brain, Mic, FileText, Send, RotateCcw } from 'lucide-react'
import { AudioInput } from '@/features/audio-recorder/components/audio-input'
import { PromptForm } from '@/features/prompt-form/components/prompt-form'
import { ReportViewer } from '@/features/report-viewer/components/report-viewer'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useTranslations } from '@/shared/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TranscriptionResult, GeneratedReport, ReportFormData, ReportRequest, ProcessingProgress } from '@/entities'
import { apiClient } from '@/services/api-client'

type ProcessingStep = 'idle' | 'transcribing' | 'generating' | 'completed' | 'error'

export default function Home() {
  const { t } = useTranslations()
  const [audioSource, setAudioSource] = useState<Blob | File | null>(null)
  const [promptData, setPromptData] = useState<ReportFormData | null>(null)
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null)
  const [report, setReport] = useState<GeneratedReport | null>(null)
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('idle')
  const [progress, setProgress] = useState<ProcessingProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resetState = useCallback(() => {
    setTranscription(null)
    setReport(null)
    setError(null)
    setProgress(null)
    setCurrentStep('idle')
  }, [])

  const handleAudioCapture = useCallback((audio: Blob | File) => {
    setAudioSource(audio)
    resetState()
  }, [resetState])

  const handlePromptSubmit = useCallback((data: ReportFormData) => {
    setPromptData(data)
  }, [])

  const handleProcess = useCallback(async (prompt: string) => {
    if (!audioSource) {
      setError(t('errors.noAudio'))
      return
    }

    try {
      setError(null)
      
      // Etapa 1: Transcrição
      setCurrentStep('transcribing')
      
      const transcriptionResult = await apiClient.transcribeAudio(
        audioSource,
        setProgress
      )
      
      setTranscription(transcriptionResult)

      // Etapa 2: Geração de relatório
      setCurrentStep('generating')
      setProgress(null) // Reset progress para mostrar loading fallback
      
      const reportRequest: ReportRequest = {
        transcription: transcriptionResult.text,
        prompt: prompt,
        systemPrompt: prompt,
        timestamp: new Date()
      }
      
      const reportResult = await apiClient.generateReport(
        reportRequest,
        setProgress
      )
      
      setReport(reportResult)
      setCurrentStep('completed')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknown'))
      setCurrentStep('error')
    }
  }, [audioSource, t])

  const handleStartOver = () => {
    setCurrentStep('idle')
    setAudioSource(null)
    setPromptData(null)
    setTranscription(null)
    setReport(null)
    setError(null)
    setProgress(null)
  }

  const canProcess = audioSource && promptData && promptData.prompt.length >= 20 && currentStep === 'idle'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ThemeToggle />
      <LanguageToggle />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 pt-8 sm:pt-0">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{t('app.title')}</h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {t('app.subtitle')}
          </p>
        </div>

        {/* Error Display - só mostra se houve erro durante processamento */}
        {error && currentStep === 'error' && (
          <Card className="mb-8 border-destructive">
            <CardContent className="p-4">
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {currentStep === 'idle' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Audio Input */}
            <div className="space-y-6">
              <AudioInput 
                onAudioReady={handleAudioCapture}
                onAudioRemove={() => setAudioSource(null)}
              />
            </div>

            {/* Prompt Configuration */}
            <div className="space-y-6">
              <PromptForm 
                onSubmit={handlePromptSubmit}
                isLoading={false}
                showSubmitButton={false}
              />
            </div>

            {/* Process Button */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
                      <div className={`flex items-center gap-2 ${audioSource ? 'text-green-600' : ''}`}>
                        <div className={`w-2 h-2 rounded-full ${audioSource ? 'bg-green-500' : 'bg-muted-foreground'}`}></div>
                        {t('processing.audio_ready', { status: audioSource ? t('audio.ready') : t('audio.pending') })}
                      </div>
                      <div className={`flex items-center gap-2 ${promptData && promptData.prompt.length >= 20 ? 'text-green-600' : ''}`}>
                        <div className={`w-2 h-2 rounded-full ${promptData && promptData.prompt.length >= 20 ? 'bg-green-500' : 'bg-muted-foreground'}`}></div>
                        {t('processing.prompt_ready', { status: promptData && promptData.prompt.length >= 20 ? t('processing.configured') : t('audio.pending') })}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleProcess(promptData?.prompt || t('processing.default_prompt'))}
                      disabled={!canProcess}
                      size="lg"
                      className="gap-2"
                    >
                      <Send className="h-5 w-5" />
                      {t('processing.process_ai')}
                      {audioSource && promptData && promptData.prompt.length >= 20 && (
                        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                          {t('processing.all_ready')}
                        </span>
                      )}
                    </Button>

                    {!audioSource || !promptData || promptData.prompt.length < 20 ? (
                      <p className="text-sm text-muted-foreground">
                        {!audioSource && (!promptData || promptData.prompt.length < 20)
                          ? t('processing.config_audio_prompt')
                          : !audioSource 
                          ? t('processing.record_upload_audio')
                          : t('processing.configure_prompt')
                        }
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Processing State - Transcrição */}
        {currentStep === 'transcribing' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="flex justify-center items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <Mic className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">
                    🎤 Transcrevendo Áudio
                  </h3>
                  <p className="text-muted-foreground">
                    Convertendo seu áudio em texto usando inteligência artificial
                  </p>
                </div>

                {/* Barra de progresso animada */}
                {progress && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-lg font-medium text-primary mb-2">{progress.message}</p>
                      <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                        <span>Etapa {progress.current} de {progress.total}</span>
                        <span>•</span>
                        <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden" 
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading fallback sem progresso */}
                {!progress && (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                    <p className="text-center text-muted-foreground">Iniciando transcrição...</p>
                  </div>
                )}

                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    ⏱️ Este processo pode levar alguns minutos, dependendo do tamanho do arquivo.
                    <br />
                    💡 Mantenha esta janela aberta até a conclusão.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Processing State - Geração de Relatório */}
        {currentStep === 'generating' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="flex justify-center items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                      <Brain className="w-6 h-6 text-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">
                    🧠 Gerando Relatório
                  </h3>
                  <p className="text-muted-foreground">
                    Analisando a transcrição e criando um relatório estruturado
                  </p>
                </div>

                {/* Barra de progresso para geração */}
                {progress && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-lg font-medium text-green-600 mb-2">{progress.message}</p>
                      <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                        <span>Etapa {progress.current} de {progress.total}</span>
                        <span>•</span>
                        <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden" 
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading fallback sem progresso */}
                {!progress && (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                    <p className="text-center text-muted-foreground">Analisando com IA...</p>
                  </div>
                )}

                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    ✨ A IA está processando sua transcrição para criar um relatório detalhado
                    <br />
                    📋 Em breve você terá seu relatório médico estruturado
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Display */}
        {currentStep === 'completed' && report && transcription && (
          <div className="space-y-8">
            {/* Transcription Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transcrição do Áudio
                  <span className="text-sm text-muted-foreground font-normal">
                    ({transcription.text.length} caracteres)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-md max-h-48 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {transcription.text}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Report Viewer */}
            <ReportViewer report={report} />

            {/* Actions */}
            <Card>
              <CardContent className="p-4 text-center">
                <Button onClick={handleStartOver} variant="outline" size="lg" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Processar Nova Consulta
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}