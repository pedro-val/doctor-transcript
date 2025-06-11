'use client'

import { useState } from 'react'
import { Copy, Download, FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GeneratedReport } from '@/entities'
import { copyToClipboard, downloadFile } from '@/shared/lib/utils'

interface ReportViewerProps {
  report: GeneratedReport
  className?: string
}

export function ReportViewer({ report, className }: ReportViewerProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleCopy = async () => {
    try {
      await copyToClipboard(report.content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      // Error handling could be improved with user notification
    }
  }

  const handleDownload = () => {
    try {
      setIsDownloading(true)
      const filename = `relatorio-medico-${report.timestamp.toISOString().split('T')[0]}.txt`
      const content = `RELATÓRIO MÉDICO GERADO POR IA
      
Data: ${report.timestamp.toLocaleString('pt-BR')}

CONFIGURAÇÃO DA IA UTILIZADA:

Prompt utilizado:
${report.prompt}

---

RELATÓRIO GERADO:

${report.content}

---

Relatório gerado automaticamente pela aplicação
ID do Relatório: ${report.id}
${report.tokens ? `Tokens utilizados: ${report.tokens}` : ''}
`
      downloadFile(content, filename)
    } catch (error) {
      // Error handling could be improved with user notification
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Relatório Gerado
        </CardTitle>
        <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Gerado em {report.timestamp.toLocaleString('pt-BR')}</span>
          {report.tokens && (
            <span className="text-xs bg-muted px-2 py-1 rounded">
              {report.tokens} tokens utilizados
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Prompt usado */}
        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">Prompt utilizado:</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {report.prompt}
          </p>
        </div>

        {/* Conteúdo do relatório */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Relatório:</h4>
          <div className="bg-background border rounded-md p-4 max-h-96 overflow-y-auto">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {report.content}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1 gap-2"
            disabled={isCopied}
          >
            {isCopied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar Texto
              </>
            )}
          </Button>
          
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 gap-2"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                Baixando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Baixar .txt
              </>
            )}
          </Button>
        </div>

        {/* Informações adicionais */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Importante:</strong> Este relatório foi gerado por inteligência artificial 
            baseado na transcrição fornecida. Sempre revise e valide as informações antes 
            de utilizar em contextos médicos profissionais.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 