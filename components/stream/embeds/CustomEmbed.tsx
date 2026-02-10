"use client"

import type { StreamItem } from "@/types/scene"

export function CustomEmbed({ item }: { item: StreamItem }) {
    return (
        <iframe
            src={item.sourceId} // Assumes sourceId is full URL for custom
            className="w-full h-full border-none"
            allowFullScreen
            title={`Custom ${item.sourceId}`}
        />
    )
}
