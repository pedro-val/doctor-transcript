'use client'

import { useState, useEffect } from 'react'
import { Mic, Upload, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AudioRecorder } from './audio-recorder'
import { AudioUploader } from './audio-uploader'
import { AudioInputState } from '@/entities'

interface AudioInputProps {
  onAudioReady: (audio: Blob | File) => void
  onAudioRemove: () => void
  className?: string
}

export function AudioInput({ onAudioReady, onAudioRemove, className }: AudioInputProps) {
  const [state, setState] = useState<AudioInputState>({
    recordedAudio: null,
    uploadedFile: null,
    activeSource: null
  })
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleRecordingComplete = (audioBlob: Blob) => {
    setState(prev => ({
      ...prev,
      recordedAudio: audioBlob,
      uploadedFile: null,
      activeSource: 'record'
    }))
    setShowSuccessMessage(true)
    onAudioReady(audioBlob)
  }

  const handleFileSelect = (file: File) => {
    setState(prev => ({
      ...prev,
      uploadedFile: file,
      recordedAudio: null,
      activeSource: 'upload'
    }))
    setShowSuccessMessage(true)
    onAudioReady(file)
  }

  const handleFileRemove = () => {
    setState(prev => ({
      ...prev,
      uploadedFile: null,
      activeSource: null
    }))
    setShowSuccessMessage(false)
    onAudioRemove()
  }

  const handleRecordingClear = () => {
    setState(prev => ({
      ...prev,
      recordedAudio: null,
      activeSource: null
    }))
    setShowSuccessMessage(false)
    onAudioRemove()
  }

  const hasAudio = state.recordedAudio || state.uploadedFile

  // Esconde a mensagem de sucesso após 3 segundos
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [showSuccessMessage])

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle>Fonte do Áudio</CardTitle>
        <CardDescription>
          Grave um novo áudio ou envie um arquivo do seu computador
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tabs */}
        <div className="flex rounded-lg bg-muted p-1">
          <Button
            variant={activeTab === 'record' ? 'default' : 'ghost'}
            className="flex-1 gap-2"
            onClick={() => setActiveTab('record')}
          >
            <Mic className="h-4 w-4" />
            Gravar
          </Button>
          <Button
            variant={activeTab === 'upload' ? 'default' : 'ghost'}
            className="flex-1 gap-2"
            onClick={() => setActiveTab('upload')}
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>

        {/* Status do áudio atual */}
        {hasAudio && showSuccessMessage && (
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md animate-in fade-in-0 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-green-500 w-2 h-2 rounded-full"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {state.activeSource === 'record' 
                    ? 'Áudio gravado pronto' 
                    : `Arquivo: ${state.uploadedFile?.name}`
                  }
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={state.activeSource === 'record' ? handleRecordingClear : handleFileRemove}
                className="text-green-700 dark:text-green-300 hover:text-red-600"
              >
                Remover
              </Button>
            </div>
          </div>
        )}

        {/* Conteúdo das tabs */}
        {activeTab === 'record' && (
          <div className="space-y-4">
            <AudioRecorder 
              onRecordingComplete={handleRecordingComplete}
              className="border-0 shadow-none"
            />
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-4">
            <AudioUploader
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={state.uploadedFile}
              className="border-0 shadow-none"
            />
          </div>
        )}

        {/* Avisos */}
        <div className="space-y-3">
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Nota:</strong> Você pode {activeTab === 'record' ? 'gravar' : 'enviar'} o áudio e 
              definir o prompt simultaneamente. Use o botão "Processar" quando estiver tudo pronto.
            </AlertDescription>
          </Alert>

          {activeTab === 'upload' && (
            <Alert variant="warning">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Arquivos Grandes:</strong> Arquivos maiores que 25MB serão automaticamente 
                divididos em segmentos menores para transcrição. O processo pode levar mais tempo, 
                mas garante 100% de compatibilidade com a OpenAI API.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 