// Parse slugs from friendly URLs
// Formats:
// - /coscu/coker/goncho (all kick - infer platform)
// - /kick/coscu/twitch/coker (explicit platforms)
// - /coscu (single streamer)

import type { StreamPlatform, ValidationResult } from '@/types/scene'

export interface ParsedStreamer {
  platform: StreamPlatform
  username: string
}

/**
 * Validate a Kick channel and return its information
 * Uses official Kick API
 */
export async function validateKickChannel(username: string): Promise<ValidationResult> {
  try {
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[validateKickChannel] Validation error:', errorMessage)
    return {
      platform: 'kick',
      username,
      valid: false,
      error: 'Validation failed'
    }
  }
}

/**
 * Parse URL slugs into streamer array
 * @param slugs - Array of URL slugs (from [...slugs] route)
 * @returns Array of parsed streamers with platform and username
 */
export function parseSlugs(slugs: string[]): ParsedStreamer[] {
  if (!slugs || slugs.length === 0) {
    return []
  }

  const streamers: ParsedStreamer[] = []
  const knownPlatforms: StreamPlatform[] = ['kick', 'twitch', 'youtube']
  const firstSlug = slugs[0]?.toLowerCase()

  // Determine format: explicit (platform/username pairs) or simple (all usernames)
  const isExplicitFormat = knownPlatforms.includes(firstSlug as StreamPlatform)

  if (isExplicitFormat) {
    // Explicit format: /platform/username/platform/username/...
    for (let i = 0; i < slugs.length; i += 2) {
      const platform = slugs[i]?.toLowerCase()
      const username = slugs[i + 1]

      // Validate platform and username pair
      if (
        platform &&
        knownPlatforms.includes(platform as StreamPlatform) &&
        username &&
        username.trim() &&
        !knownPlatforms.includes(username.toLowerCase() as StreamPlatform)
      ) {
        streamers.push({
          platform: platform as StreamPlatform,
          username: username.trim()
        })
      }
    }
  } else {
    // Simple format: all slugs are usernames, default to Kick
    for (const slug of slugs) {
      const trimmed = slug?.trim()
      if (trimmed && !knownPlatforms.includes(trimmed.toLowerCase() as StreamPlatform)) {
        streamers.push({
          platform: 'kick',
          username: trimmed.toLowerCase()
        })
      }
    }
  }

  return streamers
}

/**
 * Generate friendly URL from streamers
 * @param streamers - Array of streamer objects
 * @returns Friendly URL path
 */
export function generateFriendlyUrl(streamers: { platform: string; username: string }[]): string {
  if (!streamers || streamers.length === 0) {
    return ''
  }

  // Use explicit format: /platform/username/platform/username
  const pathParts: string[] = []

  for (const streamer of streamers) {
    pathParts.push(streamer.platform.toLowerCase())
    pathParts.push(streamer.username.toLowerCase())
  }

  return '/' + pathParts.join('/')
}
