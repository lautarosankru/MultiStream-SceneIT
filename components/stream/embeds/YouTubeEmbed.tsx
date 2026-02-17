"use client"

import { memo } from "react"
import type { StreamItem } from "@/types/scene"
import { useEmbedHost } from "@/lib/hooks/useEmbedHost"

function YouTubeEmbedComponent({ item }: { item: StreamItem }) {
    const muteParam = item.isMuted ? "1" : "0"
    const { origin } = useEmbedHost()

    // Determine if it's a Channel ID (UC...) or a Video ID
    const isChannelId = item.sourceId.startsWith("UC")

    let src = ""

    if (isChannelId) {
        // Live Stream via Channel ID
        src = `https://www.youtube.com/embed/live_stream?channel=${item.sourceId}&autoplay=1&mute=${muteParam}&controls=1&origin=${origin}`
    } else {
        // Specific Video ID
        src = `https://www.youtube-nocookie.com/embed/${item.sourceId}?autoplay=1&mute=${muteParam}&controls=1&vq=hd1080&origin=${origin}`
    }

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
