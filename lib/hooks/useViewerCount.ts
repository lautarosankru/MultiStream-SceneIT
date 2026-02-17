import { useState, useEffect, useCallback, useRef } from 'react'
import { useSceneStore } from '@/store/useSceneStore'

interface ViewerData {
  [username: string]: number
}

const POLL_INTERVAL_MS = 60_000 // 60 seconds

/**
 * Hook that polls the batch streamer API to get real-time viewer counts.
 * Returns total viewers across all active Kick streams and per-stream data.
 */
export function useViewerCount() {
  const items = useSceneStore((s) => s.items)
  const [viewerData, setViewerData] = useState<ViewerData>({})
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const itemsRef = useRef(items)
  
  // Keep ref updated with latest items
  itemsRef.current = items

  const fetchViewerCounts = useCallback(async () => {
    // Only fetch for Kick streams (only platform with viewer count support)
    const kickStreams = itemsRef.current.filter(
      (item) => item.platform === 'kick' && item.type === 'video'
    )

    if (kickStreams.length === 0) {
      setViewerData({})
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/streamers/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamers: kickStreams.map((s) => ({
            platform: 'kick',
            username: s.sourceId,
          })),
        }),
      })

      if (!response.ok) return

      const { results } = await response.json()
      
      if (!Array.isArray(results)) {
        return
      }
      
      const newData: ViewerData = {}

      for (const result of results) {
        if (
          result && 
          typeof result === 'object' &&
          typeof result.valid === 'boolean' &&
          result.valid &&
          typeof result.username === 'string' &&
          typeof result.viewerCount === 'number' &&
          !isNaN(result.viewerCount)
        ) {
          newData[result.username] = result.viewerCount
        }
      }

      setViewerData(newData)
    } catch (error) {
      console.error('[useViewerCount] Error fetching viewer counts:', error)
    } finally {
      setIsLoading(false)
    }
  }, []) // Empty deps - uses itemsRef instead

  // Fetch on mount and when items change, then poll
  useEffect(() => {
    fetchViewerCounts()

    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(fetchViewerCounts, POLL_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchViewerCounts])

  const totalViewers = Object.values(viewerData).reduce((sum, count) => sum + count, 0)

  return {
    totalViewers,
    viewerData,
    isLoading,
    refetch: fetchViewerCounts,
  }
}
