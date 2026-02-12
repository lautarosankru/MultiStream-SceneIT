"use client"

import { useState, useEffect } from "react"
import type { StreamItem } from "@/types/scene"

export function YouTubeEmbed({ item }: { item: StreamItem }) {
    // YouTube uses different params for mute/autoplay
    // mute=1 for muted
    const muteParam = item.isMuted ? "1" : "0"

    // Handling both video ID and generic URLs involves parsing logic which we did in utils.
    // sourceId here is the VIDEO ID or channel ID.
    // If it's a video ID:
    const [origin, setOrigin] = useState("")

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin)
        }
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
