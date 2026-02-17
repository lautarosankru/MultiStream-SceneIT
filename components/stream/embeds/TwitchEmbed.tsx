"use client"

import { memo } from "react"
import type { StreamItem } from "@/types/scene"
import { useEmbedHost } from "@/lib/hooks/useEmbedHost"

function TwitchEmbedComponent({ item }: { item: StreamItem }) {
    const { hostname } = useEmbedHost()

    if (!hostname) return <div className="w-full h-full bg-slate-900 animate-pulse" />

    const src = `https://player.twitch.tv/?channel=${item.sourceId}&parent=${hostname}&autoplay=true&quality=chunked`

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
