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
  } catch {
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

  // Check first slug to see if using explicit platform format (platform/username)
  // Format: /kick/coscu/twitch/coker means: platform=kick, username=coscu, platform=twitch, username=coker

  // Normalize checking: Is the first item a known platform?
  const knownPlatforms = ['kick', 'twitch', 'youtube'];
  const firstSlug = slugs[0]?.toLowerCase();

  // Heuristic: If strict platform/username pairs are used, we expect even length OR last one missing username?
  // Let's iterate and consume. If current token is a platform, next is username.
  // If current token is NOT a platform, assume it's a kick username (unless we are in explicit mode? No, mix mode is weird).
  // Actually, the original logic had two modes: Explicit vs Simple. Let's keep that but make it robust.

  const hasExplicitPlatform = knownPlatforms.includes(firstSlug);

  if (hasExplicitPlatform) {
    // Explicit format: [platform, username, platform, username, ...]
    for (let i = 0; i < slugs.length; i++) {
      const potentialPlatform = slugs[i]?.toLowerCase();

        if (knownPlatforms.includes(potentialPlatform)) {
        // It is a platform, next should be username
        const username = slugs[i + 1];
        if (username && !knownPlatforms.includes(username.toLowerCase())) {
          streamers.push({ platform: potentialPlatform as StreamPlatform, username });
          i++; // Skip username in next iteration
        } else {
          // Next is missing or is another platform? 
          // If next is platform, then this platform has no username? Skip it.
          // If next is missing, skip.
          continue;
        }
      } else {
        // Found something that is NOT a platform where a platform was expected?
        // Maybe it's a username for default platform (Kick)?
        // Or just noise. In strict explicit mode, we might skip.
        // Let's be permissive: if it's not a platform, treat as Kick username ??
        // No, the requirement was robust parsing. Mixing styles is bad.
        // Let's stick to: if we started with a platform, we expect pairs.
      }
    }
  } else {
    // Simple format: all slugs are usernames, assume default platform (Kick)
    const defaultPlatform = 'kick'

    for (const slug of slugs) {
      if (slug && slug.trim() && !knownPlatforms.includes(slug.toLowerCase())) {
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
