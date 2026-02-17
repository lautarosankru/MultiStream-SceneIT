"use client"

import { memo } from "react"
import type { StreamItem } from "@/types/scene"
import { useEmbedHost } from "@/lib/hooks/useEmbedHost"

function KickEmbedComponent({ item }: { item: StreamItem }) {
    const { hostname } = useEmbedHost()

    if (!hostname) return <div className="w-full h-full bg-slate-900 animate-pulse" />

    const src = `https://player.kick.cx/${item.sourceId}?autoplay=true&parent=${hostname}`

    return (
        <iframe
            src={src}
            className="w-full h-full border-none bg-black"
            allowFullScreen
            scrolling="no"
            title={`Kick ${item.sourceId}`}
        />
    )
}

export const KickEmbed = memo(KickEmbedComponent)
