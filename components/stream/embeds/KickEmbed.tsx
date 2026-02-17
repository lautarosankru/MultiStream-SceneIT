"use client"

import { useMemo } from "react"
import type { StreamItem } from "@/types/scene"

export function KickEmbed({ item }: { item: StreamItem }) {
    const parent = useMemo(() => {
        if (typeof window !== "undefined") return window.location.hostname
        return ""
    }, [])

    if (!parent) return <div className="w-full h-full bg-slate-900 animate-pulse" />

    const src = `https://player.kick.com/${item.sourceId}?autoplay=true&muted=${item.isMuted}&parent=${parent}`

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
