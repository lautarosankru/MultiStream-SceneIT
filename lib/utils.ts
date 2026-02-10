import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { StreamPlatform, StreamItem } from "@/types/scene"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15)
}

export { type StreamPlatform }

export function parseStreamUrl(url: string): { platform: StreamPlatform; sourceId: string } {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const hostname = urlObj.hostname.toLowerCase()
    const pathname = urlObj.pathname

    // Twitch
    if (hostname.includes('twitch.tv')) {
      const parts = pathname.split('/').filter(Boolean)
      if (parts.length > 0) {
        return { platform: 'twitch', sourceId: parts[0] }
      }
    }

    // Kick
    if (hostname.includes('kick.com')) {
      const parts = pathname.split('/').filter(Boolean)
      if (parts.length > 0) {
        return { platform: 'kick', sourceId: parts[0] }
      }
    }

    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      // https://www.youtube.com/watch?v=VIDEO_ID
      const searchParams = urlObj.searchParams
      if (searchParams.has('v')) {
        return { platform: 'youtube', sourceId: searchParams.get('v')! }
      }

      // https://youtu.be/VIDEO_ID
      if (hostname.includes('youtu.be')) {
        const parts = pathname.split('/').filter(Boolean)
        if (parts.length > 0) return { platform: 'youtube', sourceId: parts[0] }
      }

      // https://www.youtube.com/live/VIDEO_ID
      if (pathname.startsWith('/live/')) {
        const parts = pathname.split('/live/').filter(Boolean)
        if (parts.length > 0) {
          return { platform: 'youtube', sourceId: parts[0] }
        }
      }

      // https://www.youtube.com/@channel
      if (pathname.startsWith('/@')) {
        return { platform: 'youtube', sourceId: pathname } // Retain @ for channel embeds if supported, or need to resolve to ID.
        // For now, let's assume we pass the full channel identifier for channel embeds
      }
    }

    // Custom / Fallback
    return { platform: 'custom', sourceId: url }

  } catch (e) {
    return { platform: 'custom', sourceId: url }
  }
}

export function serializeLayout(items: StreamItem[]): string {
  try {
    const json = JSON.stringify(items)
    return btoa(json)
  } catch (e) {
    console.error("Failed to serialize", e)
    return ""
  }
}

export function deserializeLayout(hash: string): StreamItem[] {
  try {
    const json = atob(hash)
    return JSON.parse(json)
  } catch (e) {
    console.error("Failed to deserialize", e)
    return []
  }
}
