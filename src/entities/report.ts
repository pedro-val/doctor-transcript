export interface ReportRequest {
  prompt: string
  systemPrompt: string
  transcription: string
  timestamp: Date
}

export interface GeneratedReport {
  id: string
  content: string
  prompt: string
  systemPrompt: string
  transcriptionId: string
  timestamp: Date
  tokens?: number
}

export interface ReportFormData {
  prompt: string
}

export interface ReportState {
  isGenerating: boolean
  report: GeneratedReport | null
  error: string | null
} 