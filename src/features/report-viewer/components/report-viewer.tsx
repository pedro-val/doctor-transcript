'use client'

import { useState } from 'react'
import { Copy, Download, FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GeneratedReport } from '@/entities'
import { copyToClipboard, downloadFile } from '@/shared/lib/utils'
import { useTranslations } from '@/shared/hooks/use-translations'

interface ReportViewerProps {
  report: GeneratedReport
  className?: string
}

export function ReportViewer({ report, className }: ReportViewerProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { t } = useTranslations()

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
      const filename = t('report.download_filename', { timestamp: report.timestamp.toISOString().split('T')[0] })
      const content = `${t('report.title').toUpperCase()}
      \n${t('report.processing_time', { time: report.timestamp.toLocaleString(navigator.language) })}
\n${t('report.prompt_used')}
${report.prompt}
\n---\n\n${t('report.report_content')}\n\n${report.content}
\n---\n\nID: ${report.id}
${report.tokens ? `${report.tokens} tokens` : ''}`
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
          {t('report.title')}
        </CardTitle>
        <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>{t('report.processing_time', { time: report.timestamp.toLocaleString(navigator.language) })}</span>
          {report.tokens && (
            <span className="text-xs bg-muted px-2 py-1 rounded">
              {t('report.tokens_used', { count: report.tokens })}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Prompt usado */}
        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">{t('report.prompt_used')}</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {report.prompt}
          </p>
        </div>

        {/* Conteúdo do relatório */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('report.report_content')}</h4>
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
                {t('common.success')}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {t('report.copy_text')}
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
                {t('common.loading')}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {t('report.download_txt')}
              </>
            )}
          </Button>
        </div>

        {/* Informações adicionais */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>{t('common.important')}</strong> {t('report.important_notice')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 