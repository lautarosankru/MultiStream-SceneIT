"use client"

import type { StreamItem } from "@/types/scene"

export function KickEmbed({ item }: { item: StreamItem }) {
    const src = `https://player.kick.cx/${item.sourceId}?autoplay=true&muted=${item.isMuted}`

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
