"use client"

import { cn } from "@/lib/utils"

interface StreamOverlayProps {
    isLocked: boolean
    isDragging: boolean
}

export function StreamOverlay({ isLocked, isDragging }: StreamOverlayProps) {
    if (isLocked) return null

    return (
        <div
            className={cn(
                "absolute inset-0 z-10 transition-colors",
                // In Edit Mode (unlocked), this overlay covers the iframe to capture mouse events for dragging
                // It allows clicks to pass through only if we want to interact, but here we want to block iframes usually.
                "bg-transparent",
                // Optional visual cue when dragging
                isDragging && "bg-indigo-500/10"
            )}
        />
    )
}
