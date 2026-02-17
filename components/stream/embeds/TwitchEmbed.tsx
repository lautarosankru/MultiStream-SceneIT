"use client"

import { useMemo, memo } from "react"
import type { StreamItem } from "@/types/scene"

function TwitchEmbedComponent({ item }: { item: StreamItem }) {
    const parent = useMemo(() => {
        if (typeof window !== "undefined") return window.location.hostname
        return ""
    }, [])

    if (!parent) return <div className="w-full h-full bg-slate-900 animate-pulse" />

    const src = `https://player.twitch.tv/?channel=${item.sourceId}&parent=${parent}&muted=${item.isMuted}&autoplay=true&quality=chunked`

    return (
        <iframe
            src={src}
            className="w-full h-full border-none bg-black"
            allowFullScreen
            scrolling="no"
            title={`Twitch ${item.sourceId}`}
        />
    )
}

export const TwitchEmbed = memo(TwitchEmbedComponent)
