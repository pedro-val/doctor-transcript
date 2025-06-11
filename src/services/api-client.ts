import { TranscriptionResult, GeneratedReport, ReportRequest, ProcessingProgress } from '@/entities'

interface TranscriptionMessages {
  sending: string
  transcribing: string
}

interface ReportMessages {
  analyzing: string
  preparing: string
  processing: string
  structuring: string
}

/**
 * Cliente para chamadas às API routes internas (seguras)
 * Em vez de chamar OpenAI diretamente do frontend
 */
export class APIClient {
  
  /**
   * Transcreve áudio usando a API route interna
   */
  async transcribeAudio(
    audio: Blob | File, 
    onProgress?: (progress: ProcessingProgress) => void,
    messages?: TranscriptionMessages
  ): Promise<TranscriptionResult> {
    try {
  
      
      // Informa progresso inicial
      onProgress?.({
        stage: 'transcribing',
        step: 'analyzing',
        current: 0,
        total: 1,
        message: messages?.sending || 'Enviando áudio para transcrição...'
      })

      // Prepara FormData
      const formData = new FormData()
      formData.append('audio', audio, 'audio.wav')

      // Atualiza progresso
      onProgress?.({
        stage: 'transcribing',
        step: 'processing',
        current: 1,
        total: 1,
        message: messages?.transcribing || 'Transcrevendo áudio...'
      })

      // Chama API route interna
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Erro na transcrição')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro na resposta da API')
      }

      return result.data

    } catch (error) {
      throw error
    }
  }

  /**
   * Gera relatório usando a API route interna
   */
  async generateReport(
    request: ReportRequest,
    onProgress?: (progress: ProcessingProgress) => void,
    messages?: ReportMessages
  ): Promise<GeneratedReport> {
    try {

      
      // Etapa 1: Analisando transcrição
      onProgress?.({
        stage: 'generating',
        step: 'analyzing',
        current: 1,
        total: 4,
        message: messages?.analyzing || 'Analisando transcrição médica...'
      })
      
      await new Promise(resolve => setTimeout(resolve, 800)) // Delay para mostrar animação

      // Etapa 2: Preparando dados  
      onProgress?.({
        stage: 'generating',
        step: 'processing',
        current: 2,
        total: 4,
        message: messages?.preparing || 'Preparando dados para IA...'
      })
      
      await new Promise(resolve => setTimeout(resolve, 600))

      // Etapa 3: Processando com IA
      onProgress?.({
        stage: 'generating',
        step: 'processing',
        current: 3,
        total: 4,
        message: messages?.processing || 'Processando com inteligência artificial...'
      })

      // Chama API route interna
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      // Etapa 4: Finalizando relatório
      onProgress?.({
        stage: 'generating',
        step: 'merging',
        current: 4,
        total: 4,
        message: messages?.structuring || 'Estruturando relatório final...'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Erro na geração do relatório')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro na resposta da API')
      }

      await new Promise(resolve => setTimeout(resolve, 400)) // Delay final para mostrar conclusão

      return result.data

    } catch (error) {
      throw error
    }
  }
}

// Instância singleton do cliente
export const apiClient = new APIClient() 