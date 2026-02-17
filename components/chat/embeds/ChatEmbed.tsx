"use client"

import { memo } from "react"
import { type StreamItem } from "@/types/scene"
import { useTheme } from "next-themes"
import { useEmbedHost } from "@/lib/hooks/useEmbedHost"

interface ChatEmbedProps {
    item: StreamItem
}

function ChatEmbedComponent({ item }: ChatEmbedProps) {
    const { resolvedTheme } = useTheme()
    const { hostname } = useEmbedHost()

    if (!hostname) return <div className="w-full h-full bg-slate-900 animate-pulse" />

    const isDark = resolvedTheme === 'dark'

    switch (item.platform) {
        case 'twitch':
            const twitchSrc = `https://www.twitch.tv/embed/${item.sourceId}/chat?parent=${hostname}${isDark ? '&darkpopout' : ''}`
            return (
                <iframe
                    key={`twitch-${item.sourceId}-${resolvedTheme}`}
                    src={twitchSrc}
                    className="w-full h-full border-none"
                    title={`Twitch Chat ${item.sourceId}`}
                />
            )

        case 'kick':
            const kickSrc = `https://chat.kick.cx/embed/${item.sourceId}`
            return (
                <iframe
                    src={kickSrc}
                    className="w-full h-full border-none"
                    title={`Kick Chat ${item.sourceId}`}
                />
            )

        case 'youtube':
            const ytSrc = `https://www.youtube.com/live_chat?v=${item.sourceId}&embed_domain=${hostname}${isDark ? '&dark_theme=1' : ''}`
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

export const ChatEmbed = memo(ChatEmbedComponent)
