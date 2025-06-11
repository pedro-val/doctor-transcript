export interface ProcessingProgress {
  stage: 'transcribing' | 'generating'
  step: 'analyzing' | 'splitting' | 'processing' | 'merging'
  current: number
  total: number
  message: string
}

export type ProcessingStage = ProcessingProgress['stage']
export type ProcessingStep = ProcessingProgress['step'] 