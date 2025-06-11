import { FileAudio, Scissors, Upload, Brain, Check, Loader2 } from 'lucide-react'
import type { ProcessingStage, ProcessingStep } from '@/entities'

// Processing Constants
export const PROCESSING_CONSTANTS = {
  MAX_FILE_SIZE_MB: 25,
  TRANSCRIPTION_CHUNK_SIZE: 6000,
  PROGRESS_UPDATE_DELAY: 800,
  CHUNK_PROCESSING_DELAY: 1000,
  RATE_LIMIT_DELAY: 2000,
} as const

// Stage Configuration
export const STAGE_CONFIG: Record<ProcessingStage, {
  icon: typeof FileAudio
  title: string
  color: string
}> = {
  transcribing: {
    icon: FileAudio,
    title: 'Transcrição de Áudio',
    color: 'blue'
  },
  generating: {
    icon: Brain,
    title: 'Geração de Relatório',
    color: 'green'
  }
}

// Step Configuration
export const STEP_CONFIG: Record<ProcessingStep, {
  icon: typeof FileAudio
  title: string
  description: string
}> = {
  analyzing: {
    icon: FileAudio,
    title: 'Analisando',
    description: 'Verificando arquivo de áudio'
  },
  splitting: {
    icon: Scissors,
    title: 'Dividindo',
    description: 'Separando em segmentos menores'
  },
  processing: {
    icon: Upload,
    title: 'Processando',
    description: 'Enviando para processamento'
  },
  merging: {
    icon: Check,
    title: 'Finalizando',
    description: 'Unindo resultados'
  }
}

// Processing Icons
export const PROCESSING_ICONS = {
  spinner: Loader2,
  ...STAGE_CONFIG,
  ...STEP_CONFIG
} as const 