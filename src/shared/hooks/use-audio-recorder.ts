'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { AudioRecorderState } from '@/entities'

// Removido limite de tempo - gravações ilimitadas
// const MAX_RECORDING_TIME = 5 * 60 * 1000

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPlaying: false,
    duration: 0,
    audioBlob: null,
    error: null,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const onRecordingCompleteRef = useRef<((audioBlob: Blob) => void) | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setState(prev => ({
          ...prev,
          audioBlob,
          isRecording: false,
        }))
        
        // Chamar callback se existir
        if (onRecordingCompleteRef.current) {
          onRecordingCompleteRef.current(audioBlob)
          onRecordingCompleteRef.current = null
        }
        
        // Limpar stream
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(1000) // Coleta dados a cada 1 segundo
      startTimeRef.current = Date.now()

      setState(prev => ({
        ...prev,
        isRecording: true,
        error: null,
        duration: 0,
      }))

      // Contador de tempo (sem limite)
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current

        setState(prev => ({
          ...prev,
          duration: elapsed,
        }))
      }, 100)

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao acessar o microfone. Verifique as permissões.',
      }))
    }
  }, [])

  const stopRecording = useCallback((onComplete?: (audioBlob: Blob) => void) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      // Armazenar callback para chamar quando o blob estiver pronto
      if (onComplete) {
        onRecordingCompleteRef.current = onComplete
      }
      
      mediaRecorderRef.current.stop()
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  const clearRecording = useCallback(() => {
    setState(prev => ({
      ...prev,
      audioBlob: null,
      duration: 0,
      error: null,
    }))
  }, [])

  // Função removida pois não há mais limite de tempo
  // const getRemainingTime = useCallback(() => {
  //   return Math.max(0, MAX_RECORDING_TIME - state.duration)
  // }, [state.duration])

  const formatTime = useCallback((milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  return {
    ...state,
    startRecording,
    stopRecording,
    clearRecording,
    formatTime,
    // Removidas funções relacionadas ao limite de tempo
    // getRemainingTime,
    // maxDuration: MAX_RECORDING_TIME,
  }
} 