'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Handle session fetch errors gracefully
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('Failed to execute') && event.message?.includes('json')) {
        // Suppress NextAuth JSON parsing errors - these are handled internally
        event.preventDefault()
        if (process.env.NODE_ENV === 'development') {
          console.warn('Session fetch error suppressed - session will retry')
        }
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}
