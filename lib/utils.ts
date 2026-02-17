import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { StreamPlatform } from "@/types/scene"

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
    if (!url || typeof url !== 'string' || !url.trim()) {
      return { platform: 'custom', sourceId: url }
    }
    
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
      // youtu.be/VIDEO_ID
      if (hostname.includes('youtu.be')) {
        const parts = pathname.split('/').filter(Boolean)
        if (parts.length > 0) return { platform: 'youtube', sourceId: parts[0] }
      }

      // youtube.com/watch?v=VIDEO_ID
      const searchParams = urlObj.searchParams
      if (searchParams.has('v')) {
        return { platform: 'youtube', sourceId: searchParams.get('v')! }
      }

      // youtube.com/live/VIDEO_ID or youtube.com/@username/live
      if (pathname.startsWith('/live/')) {
        const parts = pathname.split('/live/').filter(Boolean)
        if (parts.length > 0 && parts[0]) {
          return { platform: 'youtube', sourceId: parts[0] }
        }
      }

      // youtube.com/@username
      if (pathname.startsWith('/@')) {
        return { platform: 'youtube', sourceId: pathname }
      }

      // youtube.com/username/live
      const pathParts = pathname.split('/').filter(Boolean)
      if (pathParts.length >= 2 && pathParts[1] === 'live') {
        return { platform: 'youtube', sourceId: pathParts[0] }
      }
    }

    return { platform: 'custom', sourceId: url }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[parseStreamUrl] Error parsing URL:', errorMessage)
    return { platform: 'custom', sourceId: url }
  }
}
