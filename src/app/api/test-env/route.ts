import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyStart: apiKey?.substring(0, 10) || 'não encontrada',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('OPENAI'))
  })
} 