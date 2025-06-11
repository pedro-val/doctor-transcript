'use client'

import { useRef, useState } from 'react'
import { Upload, File, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatFileSize } from '@/shared/lib/utils'

interface AudioUploaderProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  selectedFile: File | null
  className?: string
}

const ACCEPTED_AUDIO_TYPES = [
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/aac'
]

export function AudioUploader({ onFileSelect, onFileRemove, selectedFile, className }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_AUDIO_TYPES.includes(file.type)) {
      return 'Formato de arquivo não suportado. Use MP3, WAV, WebM, OGG, M4A ou AAC.'
    }
    
    // Removemos a validação de tamanho - deixamos o serviço OpenAI lidar com arquivos grandes
    // através de compressão e divisão automática
    
    return null
  }

  const handleFileSelect = (file: File) => {
    setError(null)
    
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    onFileSelect(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setError(null)
    onFileRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Áudio
        </CardTitle>
        <CardDescription>
          Envie um arquivo de áudio do seu computador (qualquer tamanho)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {!selectedFile ? (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Clique aqui ou arraste um arquivo de áudio
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos suportados: MP3, WAV, WebM, OGG, M4A, AAC
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRemoveFile}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_AUDIO_TYPES.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Dica:</strong> Para melhores resultados, use arquivos de áudio com boa qualidade 
            e pouco ruído de fundo. A transcrição funciona melhor com fala clara.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 