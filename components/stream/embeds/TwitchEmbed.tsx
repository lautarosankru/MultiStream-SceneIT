"use client"

import { useEffect, useState } from "react"
import type { StreamItem } from "@/types/scene"

export function TwitchEmbed({ item }: { item: StreamItem }) {
    const [parent, setParent] = useState<string>("")

    useEffect(() => {
        if (typeof window !== "undefined") {
            setParent(window.location.hostname)
        }
    }, [])

    if (!parent) return <div className="w-full h-full bg-slate-900 animate-pulse" />

    const src = `https://player.twitch.tv/?channel=${item.sourceId}&parent=${parent}&muted=${item.isMuted}&autoplay=true`

    return (
        <iframe
            src={src}
            className="w-full h-full border-none"
            allowFullScreen
            scrolling="no"
            title={`Twitch ${item.sourceId}`}
        />
    )
}
