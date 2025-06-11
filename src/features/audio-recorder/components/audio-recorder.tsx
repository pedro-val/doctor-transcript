'use client'

import { useState } from 'react'
import { Mic, MicOff, Play, Pause, Square, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAudioRecorder } from '@/shared/hooks/use-audio-recorder'
import { useTranslations } from '@/shared/hooks/use-translations'
import { cn } from '@/shared/lib/utils'

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void
  className?: string
}

export function AudioRecorder({ onRecordingComplete, className }: AudioRecorderProps) {
  const { t } = useTranslations()
  const {
    isRecording,
    duration,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    formatTime,
  } = useAudioRecorder()

  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const handlePlayPause = () => {
    if (!audioBlob) return

    if (!audioElement) {
      const audio = new Audio(URL.createObjectURL(audioBlob))
      audio.onended = () => setAudioElement(null)
      setAudioElement(audio)
      audio.play()
    } else {
      if (audioElement.paused) {
        audioElement.play()
      } else {
        audioElement.pause()
      }
    }
  }

  const handleStopPlaying = () => {
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
      setAudioElement(null)
    }
  }

  const handleStartRecording = async () => {
    try {
      await startRecording()
    } catch (error) {
      // Error handling is managed by the hook
    }
  }

  const handleStopRecording = () => {
    stopRecording((blob) => {
      if (onRecordingComplete) {
        onRecordingComplete(blob)
      }
    })
  }

  const handleClearRecording = () => {
    handleStopPlaying()
    clearRecording()
  }

  // Removido limite de tempo - não há mais tempo restante
  // const remainingTime = getRemainingTime()
  // const isNearLimit = remainingTime < 30000 // 30 segundos

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Mic className="h-5 w-5" />
          {t('recorder.title')}
        </CardTitle>
        <CardDescription>
          {t('recorder.description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Indicador de gravação */}
        <div className="text-center">
          <div className={cn(
            'w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-200',
            isRecording
              ? 'bg-red-500 animate-pulse-slow text-white'
              : audioBlob
              ? 'bg-green-500 text-white'
              : 'bg-muted text-muted-foreground'
          )}>
            {isRecording ? (
              <MicOff className="h-8 w-8" />
            ) : audioBlob ? (
              <div className="w-4 h-4 bg-white rounded-full"></div>
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </div>
          {audioBlob && !isRecording && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
              {t('recorder.ready')}
            </p>
          )}
        </div>

        {/* Timer */}
        <div className="text-center space-y-1">
          <div className="text-2xl font-mono">
            {formatTime(duration)}
          </div>
          {isRecording && (
            <div className="text-sm text-muted-foreground">
              {t('recorder.recording')}
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex justify-center gap-2">
          {!isRecording && !audioBlob && (
            <Button
              onClick={handleStartRecording}
              size="lg"
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              {t('recorder.start_recording')}
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={handleStopRecording}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              {t('recorder.stop_recording')}
            </Button>
          )}

          {audioBlob && !isRecording && (
            <>
              <Button
                onClick={handlePlayPause}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                {audioElement && !audioElement.paused ? (
                  <>
                    <Pause className="h-4 w-4" />
                    {t('recorder.pause')}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    {t('recorder.play')}
                  </>
                )}
              </Button>

              <Button
                onClick={handleClearRecording}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('recorder.clear')}
              </Button>
            </>
          )}
        </div>

        {/* Dicas de uso */}
        {!isRecording && !audioBlob && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground text-center">
              {t('uploader.tip_description')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 