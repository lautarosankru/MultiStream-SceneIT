"use client"

import { useMemo, memo } from "react"
import type { StreamItem } from "@/types/scene"

function YouTubeEmbedComponent({ item }: { item: StreamItem }) {
    const muteParam = item.isMuted ? "1" : "0"

    const origin = useMemo(() => {
        if (typeof window !== "undefined") return window.location.origin
        return ""
    }, [])

    const src = `https://www.youtube-nocookie.com/embed/${item.sourceId}?autoplay=1&mute=${muteParam}&controls=1&vq=hd1080&origin=${origin}`

    return (
        <iframe
            src={src}
            className="w-full h-full border-none bg-black"
            allowFullScreen
            title={`YouTube ${item.sourceId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
    )
}

export const YouTubeEmbed = memo(YouTubeEmbedComponent)
