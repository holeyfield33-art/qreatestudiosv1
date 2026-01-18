import { handlers } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

// Export the handlers directly with better error handling
export async function GET(req: NextRequest) {
  try {
    const response = await handlers.GET(req as any)
    
    // Ensure we always return a valid response
    if (!response) {
      return NextResponse.json({ error: 'No response from auth handler' }, { status: 500 })
    }
    
    return response
  } catch (error) {
    console.error('Auth GET error:', error)
    return NextResponse.json(
      { error: 'Authentication error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const response = await handlers.POST(req as any)
    
    // Ensure we always return a valid response
    if (!response) {
      return NextResponse.json({ error: 'No response from auth handler' }, { status: 500 })
    }
    
    return response
  } catch (error) {
    console.error('Auth POST error:', error)
    return NextResponse.json(
      { error: 'Authentication error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

