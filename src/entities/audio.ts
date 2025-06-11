export interface AudioRecording {
  id: string
  blob: Blob
  duration: number
  timestamp: Date
  mimeType: string
}

export interface TranscriptionResult {
  id: string
  text: string
  audioId: string
  timestamp: Date
  confidence?: number
}

export interface AudioRecorderState {
  isRecording: boolean
  isPlaying: boolean
  duration: number
  audioBlob: Blob | null
  error: string | null
}

export interface AudioSource {
  type: 'recorded' | 'uploaded'
  blob: Blob
  file?: File
  duration?: number
  timestamp: Date
}

export interface AudioInputState {
  recordedAudio: Blob | null
  uploadedFile: File | null
  activeSource: 'record' | 'upload' | null
} 