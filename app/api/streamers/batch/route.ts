import { NextResponse } from 'next/server'
import { fetchKickAPI } from '@/lib/kick-auth'

interface StreamerInput {
  platform: string
  username: string
}

// Validate multiple streamers in parallel
// POST /api/streamers/batch
// Body: { streamers: [{ platform: 'kick', username: 'coscu' }, ...] }
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const streamers: StreamerInput[] = body.streamers || []

    if (streamers.length === 0) {
      return NextResponse.json({ error: 'No streamers provided' }, { status: 400 })
    }

    // Validate all streamers in parallel
    const results = await Promise.all(
      streamers.map(async (streamer) => {
        const { platform, username } = streamer
        const normalizedPlatform = platform?.toLowerCase() || 'kick'

        try {
          if (normalizedPlatform === 'kick') {
            const res = await fetch(`https://kick.com/api/v2/channels/${username}`, {
              next: { revalidate: 300 }
            })

            if (!res.ok) {
              return {
                platform: 'kick',
                username,
                valid: false,
                error: 'Channel not found'
              }
            }

            const channel = await res.json()
            
            if (!channel.id) {
              return {
                platform: 'kick',
                username,
                valid: false,
                error: 'Channel not found'
              }
            }

            return {
              platform: 'kick',
              username,
              valid: true,
              isLive: channel.livestream?.isLive || false,
              avatar: channel.user?.profile_pic || null,
              displayName: channel.user?.username || username,
              viewerCount: channel.livestream?.viewer_count || 0,
              category: channel.livestream?.categories?.[0]?.name || null
            }
          }

          return {
            platform: normalizedPlatform,
            username,
            valid: false,
            error: 'Platform not supported yet'
          }
        } catch (error) {
          return {
            platform: normalizedPlatform,
            username,
            valid: false,
            error: 'Validation failed'
          }
        }
      })
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Batch validation error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
