import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from './alert'
import type { ProcessingProgress } from '@/entities'
import { STAGE_CONFIG, STEP_CONFIG } from '@/shared/config/processing'

interface ProcessingStatusProps {
  progress: ProcessingProgress | null
}

export function ProcessingStatus({ progress }: ProcessingStatusProps) {
  if (!progress) return null

  const stageInfo = STAGE_CONFIG[progress.stage]
  const stepInfo = STEP_CONFIG[progress.step]
  const StageIcon = stageInfo.icon
  const StepIcon = stepInfo.icon
  
  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <Alert variant="info" className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <div className="space-y-4">
        {/* Header com estágio atual */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <StageIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <AlertDescription>
              <div className="font-semibold text-blue-800 dark:text-blue-200 text-base">
                {stageInfo.title}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {progress.message}
              </div>
            </AlertDescription>
          </div>
        </div>

        {/* Detalhes da etapa atual */}
        <div className="flex items-center gap-3 pl-2">
          <StepIcon className="h-4 w-4 text-blue-500" />
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {stepInfo.title} - {stepInfo.description}
            </div>
            {progress.total > 1 && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {progress.current} de {progress.total} processados
              </div>
            )}
          </div>
        </div>

        {/* Barra de progresso */}
        {progress.total > 1 && (
          <div className="space-y-2">
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${Math.max(progressPercentage, 8)}%`
                }}
              >
                <span className="text-xs text-white font-medium">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Alert>
  )
} 