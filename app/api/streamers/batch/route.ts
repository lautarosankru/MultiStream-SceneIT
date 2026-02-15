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
            const res = await fetchKickAPI(`/public/v1/channels?slug=${username}`, {
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

            const json = await res.json()
            if (!json.data || json.data.length === 0) {
              return {
                platform: 'kick',
                username,
                valid: false,
                error: 'Channel not found'
              }
            }

            const channel = json.data[0]
            return {
              platform: 'kick',
              username,
              valid: true,
              isLive: channel.isLive,
              avatar: channel.user?.avatar?.imageUrl || null,
              displayName: channel.user?.username || username,
              viewerCount: channel.viewerCount || 0,
              category: channel.categories?.[0]?.name || null
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
