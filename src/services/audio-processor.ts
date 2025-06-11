import { PROCESSING_CONSTANTS } from '@/shared/config/processing'

export class AudioProcessor {
  private readonly maxFileSizeMB: number

  constructor(maxFileSizeMB: number = PROCESSING_CONSTANTS.MAX_FILE_SIZE_MB) {
    this.maxFileSizeMB = maxFileSizeMB
  }

  /**
   * Verifica se o arquivo está dentro do limite de tamanho
   */
  isWithinSizeLimit(audioBlob: Blob): boolean {
    const fileSizeMB = audioBlob.size / (1024 * 1024)
    return fileSizeMB <= this.maxFileSizeMB
  }

  /**
   * Obtém o tamanho do arquivo em MB
   */
  getFileSizeMB(audioBlob: Blob): number {
    return audioBlob.size / (1024 * 1024)
  }

  /**
   * Divide áudio em chunks para processamento
   */
  async splitAudio(audioBlob: Blob, chunkSizeMB: number = this.maxFileSizeMB): Promise<Blob[]> {
    const chunks: Blob[] = []
    const chunkSizeBytes = chunkSizeMB * 1024 * 1024
    
    if (audioBlob.size <= chunkSizeBytes) {
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
      chunks.push(chunk)
      start = end
      chunkIndex++
    }

    return chunks
  }

  /**
   * Valida se o arquivo de áudio é válido
   */
  validateAudioFile(audioBlob: Blob): { isValid: boolean; error?: string } {
    if (!audioBlob) {
      return { isValid: false, error: 'Arquivo de áudio não fornecido' }
    }

    if (audioBlob.size === 0) {
      return { isValid: false, error: 'Arquivo de áudio está vazio' }
    }

    // Verifica tipos MIME suportados
    const supportedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg']
    if (audioBlob.type && !supportedTypes.includes(audioBlob.type)) {
      return { isValid: false, error: `Tipo de arquivo não suportado: ${audioBlob.type}` }
    }

    return { isValid: true }
  }

  /**
   * Prepara FormData para envio à API de transcrição
   */
  prepareFormData(audioBlob: Blob, model: string = 'whisper-1'): FormData {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.wav')
    formData.append('model', model)
    formData.append('response_format', 'json')
    return formData
  }
} 