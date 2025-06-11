import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenAIService } from '../openai'

// Mock fetch
global.fetch = vi.fn()

describe('OpenAIService', () => {
  let service: OpenAIService
  
  beforeEach(() => {
    service = new OpenAIService('test-api-key', 'https://api.openai.com/v1')
    vi.clearAllMocks()
  })

  describe('transcribeAudio', () => {
    it('should transcribe audio successfully', async () => {
      const mockResponse = {
        text: 'Paciente apresenta dor de cabeça há 3 dias.',
        confidence: 0.95
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const audioBlob = new Blob(['fake audio data'], { type: 'audio/webm' })
      const result = await service.transcribeAudio(audioBlob)

      expect(result.text).toBe(mockResponse.text)
      expect(result.confidence).toBe(mockResponse.confidence)
      expect(result.id).toBeDefined()
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it('should handle transcription errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      })

      const audioBlob = new Blob(['fake audio data'], { type: 'audio/webm' })
      
      await expect(service.transcribeAudio(audioBlob)).rejects.toThrow('Erro na transcrição: Bad Request')
    })
  })

  describe('generateReport', () => {
    it('should generate report successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Relatório médico detalhado baseado na consulta...'
          }
        }],
        usage: {
          total_tokens: 150
        }
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const request = {
        prompt: 'Gere um relatório médico',
        transcription: 'Paciente com dor de cabeça',
        timestamp: new Date()
      }

      const result = await service.generateReport(request)

      expect(result.content).toBe(mockResponse.choices[0].message.content)
      expect(result.prompt).toBe(request.prompt)
      expect(result.tokens).toBe(mockResponse.usage.total_tokens)
      expect(result.id).toBeDefined()
    })

    it('should handle report generation errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized'
      })

      const request = {
        prompt: 'Gere um relatório médico',
        transcription: 'Paciente com dor de cabeça',
        timestamp: new Date()
      }
      
      await expect(service.generateReport(request)).rejects.toThrow('Erro na geração do relatório: Unauthorized')
    })
  })
}) 