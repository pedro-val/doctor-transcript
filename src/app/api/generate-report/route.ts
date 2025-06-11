import { NextRequest, NextResponse } from 'next/server'
import { OpenAIService } from '@/services/openai'
import { ReportRequest } from '@/entities'

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

    // Parse do JSON body
    const reportRequest: ReportRequest = await request.json()

    if (!reportRequest.transcription || !reportRequest.prompt) {
      return NextResponse.json(
        { error: 'Transcrição e prompt são obrigatórios' },
        { status: 400 }
      )
    }

    // Cria instância do serviço OpenAI com a chave do servidor
    const openaiService = new OpenAIService(apiKey)

    // Gera o relatório
    const result = await openaiService.generateReport(reportRequest)
    
    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    
    return NextResponse.json(
      {
        error: 'Erro interno do servidor durante a geração do relatório',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 