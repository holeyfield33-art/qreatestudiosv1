export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export function getShortUrl(shortCode: string): string {
  return `${getBaseUrl()}/${shortCode}`
}

export function getQRDownloadUrl(id: string, format: 'png' | 'svg' | 'pdf' = 'png'): string {
  return `${getBaseUrl()}/api/qr/${id}/download?format=${format}`
}

export function generateShortCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
