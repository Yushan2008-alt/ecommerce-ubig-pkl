export interface ConsumeDownloadResult {
  success: boolean
  downloadUrl?: string
  fileName?: string
  remainingDownloads?: number
  expiresAt?: string
  error?: string
}
