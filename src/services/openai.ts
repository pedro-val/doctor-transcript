import { TranscriptionResult, GeneratedReport, ReportRequest, ProcessingProgress } from '@/entities'
import { PROCESSING_CONSTANTS } from '@/shared/config/processing'
import { AudioProcessor } from './audio-processor'
import { ProgressManager } from './progress-manager'

// Configuração das variáveis de ambiente
// Use OPENAI_API_KEY no .env.local (sem NEXT_PUBLIC para maior segurança)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_API_URL = 'https://api.openai.com/v1'
const { MAX_FILE_SIZE_MB, TRANSCRIPTION_CHUNK_SIZE, CHUNK_PROCESSING_DELAY, RATE_LIMIT_DELAY } = PROCESSING_CONSTANTS

export class OpenAIService {
  private apiKey: string
  private baseUrl: string
  private audioProcessor: AudioProcessor

  constructor(apiKey?: string, baseUrl: string = OPENAI_API_URL) {
    // Se uma API key for fornecida explicitamente, use ela. Caso contrário, use a do ambiente
    this.apiKey = apiKey || OPENAI_API_KEY
    this.baseUrl = baseUrl
    this.audioProcessor = new AudioProcessor()
    
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY não foi configurada. Verifique seu arquivo .env.local com OPENAI_API_KEY=sua_chave_aqui')
    }
  }



    // Função principal de transcrição com tratamento de arquivos grandes
  async transcribeAudio(audio: Blob | File, onProgress?: (progress: ProcessingProgress) => void): Promise<TranscriptionResult> {
    const audioBlob = audio instanceof File ? audio : audio
    const fileSizeMB = this.audioProcessor.getFileSizeMB(audioBlob)
    const progressManager = new ProgressManager(onProgress)

    // Valida o arquivo de áudio
    const validation = this.audioProcessor.validateAudioFile(audioBlob)
    if (!validation.isValid) {
      throw new Error(`Arquivo de áudio inválido: ${validation.error}`)
    }

    // Informa que está analisando o arquivo
    progressManager.reportAnalyzing(fileSizeMB)

    // Se o arquivo está dentro do limite, processa normalmente
    if (this.audioProcessor.isWithinSizeLimit(audioBlob)) {
      progressManager.reportProcessing('transcribing', 1, 1)
      return this.transcribeSingleFile(audioBlob)
    }

    // Para arquivos maiores que 25MB, vai direto para divisão em chunks
    return this.transcribeInChunks(audioBlob, progressManager)
  }

  // Transcreve um único arquivo
  private async transcribeSingleFile(audio: Blob): Promise<TranscriptionResult> {
    const formData = this.audioProcessor.prepareFormData(audio)

    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Erro na transcrição: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      id: crypto.randomUUID(),
      text: data.text,
      audioId: crypto.randomUUID(),
      timestamp: new Date(),
      confidence: data.confidence,
    }
  }

  // Transcreve arquivo dividido em chunks
  private async transcribeInChunks(audio: Blob, progressManager: ProgressManager): Promise<TranscriptionResult> {
    // Informa que está dividindo
    progressManager.reportSplitting()
    
    const chunks = await this.audioProcessor.splitAudio(audio)

    const transcriptions: string[] = []
    let totalConfidence = 0

    for (let i = 0; i < chunks.length; i++) {
      // Atualiza progresso
      progressManager.reportProcessing('transcribing', i + 1, chunks.length, `Transcrevendo segmento ${i + 1} de ${chunks.length}...`)
      
      try {
        const chunkResult = await this.transcribeSingleFile(chunks[i])
        transcriptions.push(chunkResult.text)
        totalConfidence += chunkResult.confidence || 0

        // Pequena pausa entre requests para evitar rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, CHUNK_PROCESSING_DELAY))
        }
      } catch (error) {
        transcriptions.push(`[Erro na transcrição do segmento ${i + 1}]`)
      }
    }

    // Informa que está juntando os resultados
    progressManager.reportMerging('transcribing', chunks.length)

    // Junta todas as transcrições
    const fullTranscription = transcriptions.join(' ').trim()
    const averageConfidence = totalConfidence / chunks.length

    return {
      id: crypto.randomUUID(),
      text: fullTranscription,
      audioId: crypto.randomUUID(),
      timestamp: new Date(),
      confidence: averageConfidence,
    }
  }

  async generateReport(request: ReportRequest, onProgress?: (progress: ProcessingProgress) => void): Promise<GeneratedReport> {
    const transcriptionLength = request.transcription.length

    // Se a transcrição for muito longa, processamos em chunks
    if (transcriptionLength > TRANSCRIPTION_CHUNK_SIZE) {
      return this.generateReportInChunks(request, onProgress)
    }

    // Para transcrições normais, processamos normalmente
    onProgress?.({
      stage: 'generating',
      step: 'processing',
      current: 1,
      total: 1,
      message: 'Gerando relatório com IA...'
    })
    
    return this.generateSingleReport(request, request.transcription)
  }

  // Gera relatório para transcrições normais
  private async generateSingleReport(request: ReportRequest, transcription: string): Promise<GeneratedReport> {
    // Usa o prompt do usuário exatamente como foi escrito, sem modificações
    const systemPrompt = request.prompt

    // Envia apenas a transcrição, sem instruções adicionais
    const userMessage = `${transcription}`

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 2000,
          temperature: 0.1,
        }),
      })

      if (!response.ok) {
        // Tenta capturar mais detalhes do erro
        let errorDetails = response.statusText
        try {
          const errorData = await response.json()
          errorDetails = errorData.error?.message || errorData.message || response.statusText
        } catch (e) {
          // Não foi possível ler detalhes do erro
        }
        
        throw new Error(`Erro na geração do relatório: ${errorDetails}`)
      }

      const data = await response.json()
      
      return {
        id: crypto.randomUUID(),
        content: data.choices[0].message.content,
        prompt: request.prompt,
        systemPrompt: request.systemPrompt,
        transcriptionId: crypto.randomUUID(),
        timestamp: new Date(),
        tokens: data.usage?.total_tokens,
      }
    } catch (fetchError) {
      throw fetchError
    }
  }

  // Gera relatório dividindo transcrições longas em chunks
  private async generateReportInChunks(request: ReportRequest, onProgress?: (progress: ProcessingProgress) => void): Promise<GeneratedReport> {
    const chunkSize = TRANSCRIPTION_CHUNK_SIZE // Tamanho seguro para deixar espaço para o prompt
    const transcriptionChunks: string[] = []
    
    // Divide a transcrição em chunks
    for (let i = 0; i < request.transcription.length; i += chunkSize) {
      const chunk = request.transcription.substring(i, i + chunkSize)
      transcriptionChunks.push(chunk)
    }
    
    const reportParts: string[] = []
    let totalTokens = 0

    // Processa cada chunk
    for (let i = 0; i < transcriptionChunks.length; i++) {
      // Atualiza progresso
      onProgress?.({
        stage: 'generating',
        step: 'processing',
        current: i + 1,
        total: transcriptionChunks.length,
        message: `Gerando relatório - parte ${i + 1} de ${transcriptionChunks.length}...`
      })
      
      const contextInfo = i === 0 ? 'Esta é a primeira parte de uma transcrição longa.' : 
                          i === transcriptionChunks.length - 1 ? 'Esta é a última parte de uma transcrição longa.' :
                          `Esta é a parte ${i + 1} de ${transcriptionChunks.length} de uma transcrição longa.`

      const continuationInstruction = i < transcriptionChunks.length - 1 ? 
        'Continue o relatório de forma que ele possa ser unido com as próximas partes.' : 
        'Finalize o relatório considerando que esta é a última parte.'

      const chunkInstructions = `${request.prompt}

CONTEXTO: ${contextInfo}
INSTRUÇÃO DE CONTINUIDADE: ${continuationInstruction}`

      try {
        const chunkResult = await this.generateSingleReport({
          ...request,
          prompt: chunkInstructions
        }, transcriptionChunks[i])
        
        reportParts.push(chunkResult.content)
        totalTokens += chunkResult.tokens || 0

        // Pausa entre requests para evitar rate limiting
        if (i < transcriptionChunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY))
        }
      } catch (error) {
        reportParts.push(`[Erro no processamento da parte ${i + 1}/${transcriptionChunks.length}]`)
      }
    }

    // Combina os resultados
    onProgress?.({
      stage: 'generating',
      step: 'merging',
      current: transcriptionChunks.length,
      total: transcriptionChunks.length,
      message: 'Finalizando relatório...'
    })
    
    const finalContent = reportParts.join('\n\n---\n\n')
    
    return {
      id: crypto.randomUUID(),
      content: finalContent,
      prompt: request.prompt,
      systemPrompt: request.systemPrompt,
      transcriptionId: crypto.randomUUID(),
      timestamp: new Date(),
      tokens: totalTokens,
    }
  }
}

// Remover a instanciação direta que causa erro no build
// export const openAIService = new OpenAIService()

// Implementar lazy loading para evitar erro durante o build
let _openAIService: OpenAIService | null = null

export const getOpenAIService = (): OpenAIService => {
  if (!_openAIService) {
    _openAIService = new OpenAIService()
  }
  return _openAIService
}

// Manter compatibilidade com getter
export const openAIService = {
  get instance() {
    return getOpenAIService()
  },
  transcribeAudio: (...args: Parameters<OpenAIService['transcribeAudio']>) => 
    getOpenAIService().transcribeAudio(...args),
  generateReport: (...args: Parameters<OpenAIService['generateReport']>) => 
    getOpenAIService().generateReport(...args)
}