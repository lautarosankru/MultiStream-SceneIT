"use client"

import { useViewerCount } from "@/lib/hooks/useViewerCount"
import { useSceneStore } from "@/store/useSceneStore"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"

function formatViewerCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (count >= 1_000) {
    return count.toLocaleString('es-AR')
  }
  return count.toString()
}

/**
 * Displays the total viewer count across all active streams.
 * Only renders when there are streams with viewer data.
 */
export function TotalViewers() {
  const items = useSceneStore((s) => s.items)
  const { totalViewers, isLoading } = useViewerCount()

  // Don't render if no video streams
  const hasVideoStreams = items.some((item) => item.type === 'video')
  if (!hasVideoStreams) return null

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
        "bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10",
        totalViewers > 0
          ? "text-rose-600 dark:text-rose-400"
          : "text-slate-500 dark:text-slate-400"
      )}
      title={`${totalViewers.toLocaleString('es-AR')} viewers en total`}
    >
      <Eye className={cn("h-4 w-4", isLoading && "animate-pulse")} />
      <span className="tabular-nums">
        {isLoading && totalViewers === 0 ? "..." : formatViewerCount(totalViewers)}
      </span>
    </div>
  )
}
