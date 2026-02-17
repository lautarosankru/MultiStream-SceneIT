import { NextResponse } from 'next/server'
import { validateKickChannel } from '@/lib/streamers'
import { ValidationResult, StreamPlatform } from '@/types/scene'

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

    if (!Array.isArray(streamers) || streamers.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty streamers array' }, { status: 400 })
    }

    if (streamers.length > 50) {
      return NextResponse.json({ error: 'Too many streamers (max 50)' }, { status: 400 })
    }

    // Validate each streamer has required fields
    for (const streamer of streamers) {
      if (!streamer || typeof streamer !== 'object') {
        return NextResponse.json({ error: 'Invalid streamer format' }, { status: 400 })
      }
      if (typeof streamer.username !== 'string' || !streamer.username.trim()) {
        return NextResponse.json({ error: 'Invalid username' }, { status: 400 })
      }
    }

    // Validate all streamers in parallel
    const results = await Promise.all(
      streamers.map(async (streamer): Promise<ValidationResult> => {
        const { platform, username } = streamer
        const normalizedPlatform = (platform?.toLowerCase() || 'kick') as StreamPlatform

        try {
          if (normalizedPlatform === 'kick') {
            return await validateKickChannel(username)
          }

          // For Twitch and YouTube, assume valid (the embed will handle validation)
          // TODO: Implement real validation. Requires TWITCH_CLIENT_ID and YOUTUBE_API_KEY.
          if (normalizedPlatform === 'twitch' || normalizedPlatform === 'youtube') {
            return {
              platform: normalizedPlatform,
              username,
              valid: true,
              isLive: undefined, // Unknown without API
              avatar: null,
              displayName: username
            }
          }

          return {
            platform: normalizedPlatform,
            username,
            valid: false,
            error: 'Platform not supported'
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
