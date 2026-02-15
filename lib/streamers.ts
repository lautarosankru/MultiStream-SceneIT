// Parse slugs from friendly URLs
// Formats:
// - /coscu/coker/goncho (all kick - infer platform)
// - /kick/coscu/twitch/coker (explicit platforms)
// - /coscu (single streamer)

export interface ParsedStreamer {
  platform: string
  username: string
}

export interface ValidationResult {
  platform: string
  username: string
  valid: boolean
  isLive?: boolean
  avatar?: string | null
  displayName?: string
  error?: string
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
  
  // Check first slug to see if using explicit platform format
  // Format: /kick/coscu/twitch/coker means: platform=kick, username=coscu, platform=twitch, username=coker
  const firstSlug = slugs[0]
  const hasExplicitPlatform = ['kick', 'twitch', 'youtube'].includes(firstSlug.toLowerCase())

  if (hasExplicitPlatform) {
    // Explicit format: [platform, username, platform, username, ...]
    for (let i = 0; i < slugs.length; i += 2) {
      const platform = slugs[i]?.toLowerCase()
      const username = slugs[i + 1]
      
      if (platform && username && ['kick', 'twitch', 'youtube'].includes(platform)) {
        streamers.push({ platform, username })
      }
    }
  } else {
    // Simple format: all slugs are usernames, assume kick
    // Use first valid slug to infer platform for all
    const defaultPlatform = 'kick'
    
    for (const slug of slugs) {
      if (slug && slug.trim()) {
        streamers.push({ platform: defaultPlatform, username: slug.toLowerCase().trim() })
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

/**
 * Check if current URL is a friendly URL (not using ?layout= compressed)
 * @returns Whether the URL uses friendly format
 */
export function isFriendlyUrl(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.pathname !== '/' && window.location.search === ''
}
