import { NextResponse } from 'next/server'
import { fetchKickAPI } from '@/lib/kick-auth'

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
    // Validate based on platform
    if (platform === 'kick') {
      const res = await fetch(`https://kick.com/api/v2/channels/${username}`, {
        next: { revalidate: 300 }
      })

      if (!res.ok) {
        return NextResponse.json({ 
          valid: false, 
          platform: 'kick', 
          username, 
          error: 'Channel not found' 
        }, { status: 200 })
      }

      const channel = await res.json()
      
      // Channel not found
      if (!channel.id) {
        return NextResponse.json({ 
          valid: false, 
          platform: 'kick', 
          username, 
          error: 'Channel not found' 
        }, { status: 200 })
      }

      return NextResponse.json({
        valid: true,
        platform: 'kick',
        username,
        isLive: channel.livestream?.isLive || false,
        avatar: channel.user?.profile_pic || null,
        displayName: channel.user?.username || username,
        viewerCount: channel.livestream?.viewer_count || 0,
        category: channel.livestream?.categories?.[0]?.name || null
      })
    }

    // Other platforms not implemented yet
    return NextResponse.json({ 
      valid: false, 
      platform, 
      username, 
      error: 'Platform not supported yet' 
    }, { status: 200 })

  } catch (error) {
    console.error('Streamer validation error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
