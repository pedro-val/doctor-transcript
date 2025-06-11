import { TranscriptionResult, GeneratedReport, ReportRequest } from '@/entities'

export interface ProcessingProgress {
  stage: 'transcribing' | 'generating'
  step: 'analyzing' | 'splitting' | 'processing' | 'merging'
  current: number
  total: number
  message: string
}

// Removida a chave hardcoded - agora usa variável de ambiente
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_API_URL = 'https://api.openai.com/v1'
const MAX_FILE_SIZE_MB = 24 // Um pouco abaixo de 25MB para margem de segurança

export class OpenAIService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string = OPENAI_API_KEY, baseUrl: string = OPENAI_API_URL) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    
    // Remover o console.log que expõe a chave da API
    // console.log(OPENAI_API_KEY);
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY não foi configurada. Verifique seu arquivo .env.local')
    }
  }



  // Divide áudio em chunks
  private async splitAudio(audioBlob: Blob, chunkSizeMB: number = MAX_FILE_SIZE_MB): Promise<Blob[]> {
    console.log(`[OpenAI Service] Dividindo arquivo de ${(audioBlob.size / (1024 * 1024)).toFixed(2)}MB em chunks de ${chunkSizeMB}MB`)
    
    const chunks: Blob[] = []
    const chunkSizeBytes = chunkSizeMB * 1024 * 1024
    
    if (audioBlob.size <= chunkSizeBytes) {
      console.log(`[OpenAI Service] Arquivo já está dentro do limite, retornando como chunk único`)
      return [audioBlob]
    }

    // Para arquivos muito grandes, divide em chunks de tamanho fixo
    // Nota: Esta é uma divisão simples por bytes. Para melhor qualidade,
    // seria ideal dividir por tempo de áudio, mas isso requer bibliotecas adicionais
    let start = 0
    let chunkIndex = 1
    while (start < audioBlob.size) {
      const end = Math.min(start + chunkSizeBytes, audioBlob.size)
      const chunk = audioBlob.slice(start, end)
      const chunkSizeMB = chunk.size / (1024 * 1024)
      console.log(`[OpenAI Service] Criando chunk ${chunkIndex}: ${chunkSizeMB.toFixed(2)}MB (bytes ${start}-${end})`)
      chunks.push(chunk)
      start = end
      chunkIndex++
    }

    console.log(`[OpenAI Service] Divisão concluída: ${chunks.length} chunks criados`)
    return chunks
  }

    // Função principal de transcrição com tratamento de arquivos grandes
  async transcribeAudio(audio: Blob | File, onProgress?: (progress: ProcessingProgress) => void): Promise<TranscriptionResult> {
    const audioBlob = audio instanceof File ? audio : audio
    const fileSizeMB = audioBlob.size / (1024 * 1024)

    console.log(`[OpenAI Service] Iniciando transcrição de arquivo de áudio: ${fileSizeMB.toFixed(2)}MB`)
    console.log(`[OpenAI Service] Tipo do arquivo: ${audioBlob.type || 'unknown'}`)
    console.log(`[OpenAI Service] Limite configurado: ${MAX_FILE_SIZE_MB}MB`)

    // Informa que está analisando o arquivo
    onProgress?.({
      stage: 'transcribing',
      step: 'analyzing',
      current: 0,
      total: 1,
      message: `Analisando arquivo de áudio (${fileSizeMB.toFixed(1)}MB)...`
    })

    // Se o arquivo está dentro do limite, processa normalmente
    if (fileSizeMB <= MAX_FILE_SIZE_MB) {
      console.log(`[OpenAI Service] Arquivo dentro do limite (${fileSizeMB.toFixed(2)}MB). Processando normalmente...`)
      
      onProgress?.({
        stage: 'transcribing',
        step: 'processing',
        current: 1,
        total: 1,
        message: 'Transcrevendo áudio...'
      })
      
      return this.transcribeSingleFile(audioBlob)
    }

    // Para arquivos maiores que 25MB, vai direto para divisão em chunks
    console.log(`[OpenAI Service] Arquivo maior que ${MAX_FILE_SIZE_MB}MB detectado (${fileSizeMB.toFixed(2)}MB). Dividindo em chunks para evitar erros da OpenAI...`)
    return this.transcribeInChunks(audioBlob, onProgress)
  }

  // Transcreve um único arquivo
  private async transcribeSingleFile(audio: Blob): Promise<TranscriptionResult> {
    const formData = new FormData()
    formData.append('file', audio, 'audio.wav')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'json')

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
  private async transcribeInChunks(audio: Blob, onProgress?: (progress: ProcessingProgress) => void): Promise<TranscriptionResult> {
    console.log('[OpenAI Service] Dividindo áudio em segmentos...')
    
    // Informa que está dividindo
    onProgress?.({
      stage: 'transcribing',
      step: 'splitting',
      current: 0,
      total: 1,
      message: 'Dividindo arquivo em segmentos...'
    })
    
    const chunks = await this.splitAudio(audio)
    console.log(`[OpenAI Service] Arquivo dividido em ${chunks.length} segmentos`)
    
    chunks.forEach((chunk, index) => {
      const chunkSizeMB = chunk.size / (1024 * 1024)
      console.log(`[OpenAI Service] Segmento ${index + 1}: ${chunkSizeMB.toFixed(2)}MB`)
    })

    const transcriptions: string[] = []
    let totalConfidence = 0

    for (let i = 0; i < chunks.length; i++) {
      console.log(`Transcrevendo segmento ${i + 1}/${chunks.length}...`)
      
      // Atualiza progresso
      onProgress?.({
        stage: 'transcribing',
        step: 'processing',
        current: i + 1,
        total: chunks.length,
        message: `Transcrevendo segmento ${i + 1} de ${chunks.length}...`
      })
      
      try {
        const chunkResult = await this.transcribeSingleFile(chunks[i])
        transcriptions.push(chunkResult.text)
        totalConfidence += chunkResult.confidence || 0

        // Pequena pausa entre requests para evitar rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`Erro no segmento ${i + 1}:`, error)
        transcriptions.push(`[Erro na transcrição do segmento ${i + 1}]`)
      }
    }

    // Informa que está juntando os resultados
    onProgress?.({
      stage: 'transcribing',
      step: 'merging',
      current: chunks.length,
      total: chunks.length,
      message: 'Unindo transcrições dos segmentos...'
    })

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
    console.log(`[OpenAI Service] Iniciando geração de relatório com GPT-4o para transcrição de ${transcriptionLength} caracteres`)

    const totalPromptLength = request.prompt.length + transcriptionLength
    console.log(`[OpenAI Service] Tamanho total do prompt: ${totalPromptLength} caracteres`)

    // Se a transcrição for muito longa, processamos em chunks
    if (transcriptionLength > 8000) {
      console.log(`[OpenAI Service] Transcrição muito longa, processando em chunks...`)
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

      console.log(`[OpenAI Service] Status da resposta da API: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        // Tenta capturar mais detalhes do erro
        let errorDetails = response.statusText
        try {
          const errorData = await response.json()
          errorDetails = errorData.error?.message || errorData.message || response.statusText
          console.error(`[OpenAI Service] Detalhes do erro da API:`, errorData)
        } catch (e) {
          console.error(`[OpenAI Service] Não foi possível ler detalhes do erro`)
        }
        
        throw new Error(`Erro na geração do relatório: ${errorDetails}`)
      }

      const data = await response.json()
      
      return {
        id: crypto.randomUUID(),
        content: data.choices[0].message.content,
        prompt: request.prompt,
        systemPrompt: request.prompt, // Agora o prompt é unificado
        transcriptionId: crypto.randomUUID(),
        timestamp: new Date(),
        tokens: data.usage?.total_tokens,
      }
    } catch (fetchError) {
      console.error(`[OpenAI Service] Erro de rede ou fetch:`, fetchError)
      throw fetchError
    }
  }

  // Gera relatório dividindo transcrições longas em chunks
  private async generateReportInChunks(request: ReportRequest, onProgress?: (progress: ProcessingProgress) => void): Promise<GeneratedReport> {
    console.log(`[OpenAI Service] Dividindo transcrição longa em chunks para geração de relatório com GPT-4o...`)
    
    const chunkSize = 6000 // Tamanho seguro para deixar espaço para o prompt
    const transcriptionChunks: string[] = []
    
    // Divide a transcrição em chunks
    for (let i = 0; i < request.transcription.length; i += chunkSize) {
      const chunk = request.transcription.substring(i, i + chunkSize)
      transcriptionChunks.push(chunk)
    }
    
    console.log(`[OpenAI Service] Transcrição dividida em ${transcriptionChunks.length} chunks`)
    
    const reportParts: string[] = []
    let totalTokens = 0

    // Processa cada chunk
    for (let i = 0; i < transcriptionChunks.length; i++) {
      console.log(`[OpenAI Service] Processando chunk ${i + 1}/${transcriptionChunks.length} do relatório...`)
      
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
          console.log(`[OpenAI Service] Aguardando antes do próximo chunk...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error(`[OpenAI Service] Erro no chunk ${i + 1}:`, error)
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
    
    console.log(`[OpenAI Service] Relatório em chunks concluído. Total de tokens: ${totalTokens}`)

    return {
      id: crypto.randomUUID(),
      content: finalContent,
      prompt: request.prompt,
      systemPrompt: request.prompt, // Agora o prompt é unificado
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