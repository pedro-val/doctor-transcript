'use client'

import { useState, useCallback } from 'react'
import { Stethoscope, Brain, Mic, FileText, Send, RotateCcw } from 'lucide-react'
import { AudioInput } from '@/features/audio-recorder/components/audio-input'
import { PromptForm } from '@/features/prompt-form/components/prompt-form'
import { ReportViewer } from '@/features/report-viewer/components/report-viewer'
import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getOpenAIService, ProcessingProgress } from '@/services/openai'
import { TranscriptionResult, GeneratedReport, ReportFormData } from '@/entities'
import { ProcessingStatus } from '@/components/ui/processing-status'

type AppStep = 'input' | 'processing' | 'report'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>('input')
  const [audioSource, setAudioSource] = useState<Blob | File | null>(null)
  const [promptData, setPromptData] = useState<ReportFormData | null>(null)
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null)
  const [report, setReport] = useState<GeneratedReport | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null)

  const handleAudioReady = (audio: Blob | File) => {
    setAudioSource(audio)
    setError(null)
  }

  const handleAudioRemove = () => {
    setAudioSource(null)
    setError(null)
  }

  const handlePromptChange = useCallback((data: ReportFormData) => {
    setPromptData(data)
  }, [])

  const handleProcess = async () => {
    if (!audioSource || !promptData) {
      setError('Por favor, forneça um áudio e configure o prompt antes de processar.')
      return
    }

    setError(null)
    setIsProcessing(true)
    setCurrentStep('processing')
    setProcessingProgress(null)
  
    try {
      const openAIService = getOpenAIService()
      
      // Etapa 1: Transcrição
      const transcriptionResult = await openAIService.transcribeAudio(
        audioSource, 
        (progress) => setProcessingProgress(progress)
      )
      setTranscription(transcriptionResult)
  
      // Etapa 2: Geração do relatório
      const reportRequest = {
        prompt: promptData.prompt,
        systemPrompt: promptData.prompt,
        transcription: transcriptionResult.text,
        timestamp: new Date()
      }
      
      const generatedReport = await openAIService.generateReport(
        reportRequest,
        (progress) => setProcessingProgress(progress)
      )
      setReport(generatedReport)
      setCurrentStep('report')
    } catch (error) {
      console.error('Processing error:', error)
      setError(`Erro durante o processamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setCurrentStep('input')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(null)
    }
  }

  const handleStartOver = () => {
    setCurrentStep('input')
    setAudioSource(null)
    setPromptData(null)
    setTranscription(null)
    setReport(null)
    setError(null)
    setIsProcessing(false)
    setProcessingProgress(null)
  }

  const canProcess = audioSource && promptData && !isProcessing

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Doctor AI</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforme suas consultas médicas em relatórios estruturados usando 
            inteligência artificial e transcrição automática
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="p-4">
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {currentStep === 'input' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Audio Input */}
            <div className="space-y-6">
              <AudioInput 
                onAudioReady={handleAudioReady}
                onAudioRemove={handleAudioRemove}
              />
            </div>

            {/* Prompt Configuration */}
            <div className="space-y-6">
              <PromptForm 
                onSubmit={handlePromptChange}
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
                        Áudio {audioSource ? 'pronto' : 'pendente'}
                      </div>
                      <div className={`flex items-center gap-2 ${promptData ? 'text-green-600' : ''}`}>
                        <div className={`w-2 h-2 rounded-full ${promptData ? 'bg-green-500' : 'bg-muted-foreground'}`}></div>
                        Prompt {promptData ? 'configurado' : 'pendente'}
                      </div>
                    </div>

                    <Button
                      onClick={handleProcess}
                      disabled={!canProcess}
                      size="lg"
                      className="gap-2"
                    >
                      <Send className="h-5 w-5" />
                      Processar com IA
                      {audioSource && promptData && (
                        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                          Tudo pronto!
                        </span>
                      )}
                    </Button>

                    {!audioSource || !promptData ? (
                      <p className="text-sm text-muted-foreground">
                        {!audioSource && !promptData 
                          ? 'Configure o áudio e o prompt para continuar'
                          : !audioSource 
                          ? 'Grave ou envie um áudio para continuar'
                          : 'Configure o prompt para continuar'
                        }
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Processing State */}
        {currentStep === 'processing' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold mb-2">
                    Processando com IA
                  </h3>
                  <p className="text-muted-foreground">
                    Seu áudio está sendo processado. Acompanhe o progresso abaixo.
                  </p>
                </div>

                {/* Status de progresso detalhado */}
                <ProcessingStatus progress={processingProgress} />

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Este processo pode levar alguns minutos, dependendo do tamanho do arquivo.
                    Mantenha esta janela aberta até a conclusão.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Display */}
        {currentStep === 'report' && report && transcription && (
          <div className="space-y-8">
            {/* Transcription Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Transcrição do Áudio
                </CardTitle>
                <CardDescription>
                  Processado em {transcription.timestamp.toLocaleString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-md max-h-32 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">
                    {transcription.text}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Generated Report */}
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

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            Doctor AI - Powered by OpenAI Whisper & GPT | 
            Desenvolvido com Next.js e TypeScript
          </p>
        </div>
      </div>
    </div>
  )
}