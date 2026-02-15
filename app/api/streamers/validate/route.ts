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
      const res = await fetchKickAPI(`/public/v1/channels?slug=${username}`, {
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

      const json = await res.json()
      if (!json.data || json.data.length === 0) {
        return NextResponse.json({ 
          valid: false, 
          platform: 'kick', 
          username, 
          error: 'Channel not found' 
        }, { status: 200 })
      }

      const channel = json.data[0]
      return NextResponse.json({
        valid: true,
        platform: 'kick',
        username,
        isLive: channel.isLive,
        avatar: channel.user?.avatar?.imageUrl || null,
        displayName: channel.user?.username || username,
        viewerCount: channel.viewerCount || 0,
        category: channel.categories?.[0]?.name || null
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
