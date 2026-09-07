import { useState, useEffect, useCallback, useRef } from 'react'
import { useSceneStore } from '@/store/useSceneStore'
import { VIEWER_COUNT_POLL_INTERVAL_MS } from '@/lib/config/constants'

interface ViewerData {
  [username: string]: number
}

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
  const isMountedRef = useRef(true)
  
  // Keep ref updated with latest items
  useEffect(() => {
    itemsRef.current = items
  }, [items])

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

      if (!response.ok) {
        console.error('[useViewerCount] API request failed:', response.status, response.statusText)
        return
      }

      const data = await response.json()
      const { results } = data
      
      if (!Array.isArray(results)) {
        console.error('[useViewerCount] Invalid response format: results is not an array')
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

      if (isMountedRef.current) {
        setViewerData(newData)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[useViewerCount] Error fetching viewer counts:', errorMessage)
      if (isMountedRef.current) {
        setViewerData({})
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Fetch on mount and when items change, then poll
  useEffect(() => {
    isMountedRef.current = true
    const timeoutId = setTimeout(() => {
      fetchViewerCounts()
    }, 0)

    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(fetchViewerCounts, VIEWER_COUNT_POLL_INTERVAL_MS)

    return () => {
      isMountedRef.current = false
      clearTimeout(timeoutId)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
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
