"use client"

import { useEffect, useState } from "react"
import { type StreamItem } from "@/types/scene"

interface ChatEmbedProps {
    item: StreamItem
}

export function ChatEmbed({ item }: ChatEmbedProps) {
    const [parent, setParent] = useState<string>("")

    useEffect(() => {
        if (typeof window !== "undefined") {
            setParent(window.location.hostname)
        }
    }, [])

    if (!parent) return <div className="w-full h-full bg-slate-900 animate-pulse" />

    switch (item.platform) {
        case 'twitch':
            // Twitch Chat Embed
            // https://dev.twitch.tv/docs/embed/chat/
            const twitchSrc = `https://www.twitch.tv/embed/${item.sourceId}/chat?parent=${parent}&darkpopout`
            return (
                <iframe
                    src={twitchSrc}
                    className="w-full h-full border-none"
                    title={`Twitch Chat ${item.sourceId}`}
                />
            )

        case 'kick':
            // Reverting to Iframe as Native Chat (Read-only) was rejected and Proxy failed.
            // Using standard embed URL without strict sandbox to allow cookies/session sharing if possible.
            // Many users report 'kick.com/CHANNEL/chatroom' works best for embeds.
            const kickSrc = `https://kick.com/${item.sourceId}/chatroom`
            return (
                <iframe
                    src={kickSrc}
                    className="w-full h-full border-none"
                    title={`Kick Chat ${item.sourceId}`}
                    // ENABLE LOGIN and COOKIES:
                    // allow-popups: required for Google/Apple login windows
                    // allow-popups-to-escape-sandbox: vital for login redirects
                    // allow-storage-access-by-user-activation: allows requesting cookie access
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
                />
            )

        case 'youtube':
            // YouTube Live Chat
            // Need domain for parent if using embed
            const ytSrc = `https://www.youtube.com/live_chat?v=${item.sourceId}&embed_domain=${parent}&dark_theme=1`
            return (
                <iframe
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
