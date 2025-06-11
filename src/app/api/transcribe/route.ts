import { NextRequest, NextResponse } from 'next/server'
import { OpenAIService } from '@/services/openai'

export async function POST(request: NextRequest) {
  try {
    // Verifica se a API key está configurada no servidor
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'Configuração do servidor incompleta. OPENAI_API_KEY não encontrada.',
          details: 'Verifique se o arquivo .env.local contém OPENAI_API_KEY=sua_chave_aqui'
        },
        { status: 500 }
      )
    }

    // Parse do FormData
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Arquivo de áudio não encontrado na requisição' },
        { status: 400 }
      )
    }

    // Converte File para Blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type })

    // Cria instância do serviço OpenAI com a chave do servidor
    const openaiService = new OpenAIService(apiKey)

    // Faz a transcrição
    const result = await openaiService.transcribeAudio(audioBlob)
    
    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    
    return NextResponse.json(
      {
        error: 'Erro interno do servidor durante a transcrição',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 