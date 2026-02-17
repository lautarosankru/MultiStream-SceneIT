import { NextResponse } from 'next/server'
import { validateKickChannel } from '@/lib/streamers'

// Validate a single streamer
// GET /api/streamers/validate?platform=kick&username=coscu
// Or: GET /api/streamers/validate?username=coscu (infer platform)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform') || 'kick'
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 })
  }

  try {
    if (platform === 'kick') {
      const result = await validateKickChannel(username)
      
      if (!result.valid) {
        return NextResponse.json(result, { status: 200 })
      }
      
      return NextResponse.json(result)
    }

    return NextResponse.json({ 
      valid: false, 
      platform, 
      username, 
      error: 'Platform not supported yet' 
    }, { status: 200 })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[validate] Streamer validation error:', errorMessage)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
