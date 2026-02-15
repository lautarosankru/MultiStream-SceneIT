"use client"

import { useEffect, useState } from "react"
import { type StreamItem } from "@/types/scene"

interface ChatEmbedProps {
    item: StreamItem
}

import { useTheme } from "next-themes"

export function ChatEmbed({ item }: ChatEmbedProps) {
    const [parent, setParent] = useState<string>("")
    const { resolvedTheme } = useTheme()
    // Force re-render when theme changes to update iframe URL
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined") {
            setParent(window.location.hostname)
        }
        setMounted(true)
    }, [])

    if (!parent || !mounted) return <div className="w-full h-full bg-slate-900 animate-pulse" />

    const isDark = resolvedTheme === 'dark'

    switch (item.platform) {
        case 'twitch':
            // Twitch Chat Embed
            // Add &darkpopout if dark mode
            const twitchSrc = `https://www.twitch.tv/embed/${item.sourceId}/chat?parent=${parent}${isDark ? '&darkpopout' : ''}`
            return (
                <iframe
                    key={`twitch-${item.sourceId}-${resolvedTheme}`}
                    src={twitchSrc}
                    className="w-full h-full border-none"
                    title={`Twitch Chat ${item.sourceId}`}
                />
            )

        case 'kick':
            // Kick Chat via kick.cx proxy for better compatibility
            const kickSrc = `https://chat.kick.cx/embed/${item.sourceId}`
            return (
                <iframe
                    src={kickSrc}
                    className="w-full h-full border-none"
                    title={`Kick Chat ${item.sourceId}`}
                />
            )

        case 'youtube':
            // YouTube Live Chat
            // Add &dark_theme=1 if dark mode
            const ytSrc = `https://www.youtube.com/live_chat?v=${item.sourceId}&embed_domain=${parent}${isDark ? '&dark_theme=1' : ''}`
            return (
                <iframe
                    key={`yt-${item.sourceId}-${resolvedTheme}`}
                    src={ytSrc}
                    className="w-full h-full border-none"
                    title={`YouTube Chat ${item.sourceId}`}
                />
            )

        default:
            return (
                <div className="flex items-center justify-center h-full text-slate-500 p-4 text-center">
                    <p>Chat no disponible para {item.platform}</p>
                </div>
            )
    }
}
