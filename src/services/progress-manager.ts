import type { ProcessingProgress, ProcessingStage, ProcessingStep } from '@/entities'
import { PROCESSING_CONSTANTS } from '@/shared/config/processing'

export class ProgressManager {
  private onProgress?: (progress: ProcessingProgress) => void

  constructor(onProgress?: (progress: ProcessingProgress) => void) {
    this.onProgress = onProgress
  }

  /**
   * Atualiza o progresso e chama o callback
   */
  updateProgress(stage: ProcessingStage, step: ProcessingStep, current: number, total: number, message: string): void {
    this.onProgress?.({
      stage,
      step,
      current,
      total,
      message
    })
  }

  /**
   * Informa progresso de análise de arquivo
   */
  reportAnalyzing(fileSizeMB: number): void {
    this.updateProgress(
      'transcribing',
      'analyzing',
      0,
      1,
      `Analisando arquivo de áudio (${fileSizeMB.toFixed(1)}MB)...`
    )
  }

  /**
   * Informa progresso de divisão de arquivo
   */
  reportSplitting(): void {
    this.updateProgress(
      'transcribing',
      'splitting',
      0,
      1,
      'Dividindo arquivo em segmentos...'
    )
  }

  /**
   * Informa progresso de processamento
   */
  reportProcessing(stage: ProcessingStage, current: number, total: number, contextMessage?: string): void {
    const baseMessage = stage === 'transcribing' ? 
      'Transcrevendo áudio...' : 
      'Gerando relatório com IA...'
    
    const message = contextMessage || (total > 1 ? 
      `${baseMessage.replace('...', '')} - ${current} de ${total}` : 
      baseMessage)

    this.updateProgress(stage, 'processing', current, total, message)
  }

  /**
   * Informa progresso de fusão/finalização
   */
  reportMerging(stage: ProcessingStage, total: number): void {
    const message = stage === 'transcribing' ? 
      'Unindo transcrições dos segmentos...' : 
      'Finalizando relatório...'

    this.updateProgress(stage, 'merging', total, total, message)
  }

  /**
   * Cria uma instância para um processamento específico com delays
   */
  async withStageDelay<T>(stage: ProcessingStage, operation: () => Promise<T>): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, PROCESSING_CONSTANTS.PROGRESS_UPDATE_DELAY))
    return operation()
  }

  /**
   * Executa operação com delay de rate limiting
   */
  async withRateLimit<T>(operation: () => Promise<T>): Promise<T> {
    const result = await operation()
    await new Promise(resolve => setTimeout(resolve, PROCESSING_CONSTANTS.RATE_LIMIT_DELAY))
    return result
  }

  /**
   * Executa operação com delay de chunk processing
   */
  async withChunkDelay<T>(operation: () => Promise<T>): Promise<T> {
    const result = await operation()
    await new Promise(resolve => setTimeout(resolve, PROCESSING_CONSTANTS.CHUNK_PROCESSING_DELAY))
    return result
  }
} 